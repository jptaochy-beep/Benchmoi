import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export const MODEL = process.env.CI_MODEL || "claude-opus-5-5";

/** Fallback serveur en cas de refus des classifieurs de sécurité. */
const BETAS: Anthropic.Beta.AnthropicBeta[] = ["server-side-fallback-2026-07-01"];

let _client: Anthropic | null = null;
export function client(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export class AIError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

export const BASE_SYSTEM = `Tu es le moteur de McCANN Creative Intelligence, outil interne des équipes créatives McCann Abidjan, Douala et Dakar (concepteurs-rédacteurs, directeurs artistiques, planneurs stratégiques).

Règles absolues :
- N'invente JAMAIS une campagne, une marque, une agence, une année, un prix, un chiffre d'efficacité ou une URL. Si tu ne sais pas, dis-le.
- Distingue toujours ce qui est un FAIT SOURCÉ de ce qui est ton ANALYSE.
- Ne confonds jamais une campagne primée (award), une campagne populaire (audience) et une campagne à l'efficacité commerciale prouvée (résultats business sourcés).
- Réponds en français, sauf citations.
- Écris pour les marchés d'Afrique francophone avec justesse culturelle, sans caricature.`;

export interface ResearchResult {
  notes: string;
  /** URL réellement renvoyées par le moteur de recherche / lues par web_fetch → titre */
  urls: Map<string, string>;
  fetchedTexts: Map<string, string>;
}

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|ref$|si$)/i.test(k)) u.searchParams.delete(k);
    }
    const host = u.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
    let p = u.pathname.replace(/\/+$/, "");
    if (host === "youtu.be") return `youtube.com/watch?v=${p.slice(1)}`;
    const qs = u.searchParams.toString();
    return `${host}${p}${qs ? `?${qs}` : ""}`;
  } catch {
    return raw.trim().toLowerCase();
  }
}

/**
 * Étape « recherche outillée » : le modèle utilise web_search (et web_fetch si autorisé).
 * Le serveur collecte la liste EXACTE des URL renvoyées par les outils : c'est la seule
 * liste dans laquelle les références pourront être choisies ensuite.
 */
export async function research(opts: {
  system: string;
  prompt: string;
  maxSearches: number;
  allowFetch?: boolean;
  effort?: "low" | "medium" | "high";
}): Promise<ResearchResult> {
  const c = client();
  const tools: Anthropic.Beta.BetaToolUnion[] = [
    { type: "web_search_20260209", name: "web_search", max_uses: opts.maxSearches },
  ];
  if (opts.allowFetch) tools.push({ type: "web_fetch_20260209", name: "web_fetch", max_uses: 4 });

  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: opts.prompt }];
  const urls = new Map<string, string>();
  const fetchedTexts = new Map<string, string>();
  const notes: string[] = [];

  for (let turn = 0; turn < 6; turn++) {
    const stream = c.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: BETAS,
      fallbacks: "default",
      system: opts.system,
      thinking: { type: "adaptive" },
      output_config: { effort: opts.effort ?? "medium" },
      tools,
      messages,
    });
    const msg = await stream.finalMessage();

    if (msg.stop_reason === "refusal") {
      throw new AIError("La requête a été refusée par le modèle. Reformulez la demande.", 422);
    }

    for (const block of msg.content) {
      if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const r of block.content) urls.set(normalizeUrl(r.url), r.title);
      } else if (block.type === "web_fetch_tool_result" && block.content.type === "web_fetch_result") {
        const doc = block.content.content;
        urls.set(normalizeUrl(block.content.url), doc.title ?? block.content.url);
        if (doc.source.type === "text") fetchedTexts.set(normalizeUrl(block.content.url), doc.source.data);
      } else if (block.type === "text") {
        notes.push(block.text);
        for (const cit of block.citations ?? []) {
          if (cit.type === "web_search_result_location") urls.set(normalizeUrl(cit.url), cit.title ?? cit.url);
        }
      }
    }

    if (msg.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: msg.content as Anthropic.Beta.BetaContentBlockParam[] });
      continue;
    }
    break;
  }

  return { notes: notes.join("\n"), urls, fetchedTexts };
}

/** Étape « extraction structurée » : JSON validé par schéma Zod, sans outils. */
export async function structured<S extends z.ZodType>(opts: {
  schema: S;
  system: string;
  prompt: string;
  effort?: "low" | "medium" | "high";
}): Promise<z.infer<S>> {
  const stream = client().beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    betas: BETAS,
    fallbacks: "default",
    system: opts.system,
    thinking: { type: "adaptive" },
    output_config: { effort: opts.effort ?? "medium", format: betaZodOutputFormat(opts.schema) },
    messages: [{ role: "user", content: opts.prompt }],
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") {
    throw new AIError("La requête a été refusée par le modèle. Reformulez la demande.", 422);
  }
  if (msg.stop_reason === "max_tokens") {
    throw new AIError("Réponse tronquée (limite de longueur atteinte). Réessayez avec une demande plus ciblée.");
  }
  const text = msg.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const parsed = opts.schema.safeParse(JSON.parse(text));
  if (!parsed.success) throw new AIError("Réponse du modèle non conforme au schéma attendu.");
  return parsed.data;
}

/** Traduit les erreurs SDK en messages lisibles pour l'interface. */
export function toHttpError(e: unknown): { message: string; status: number } {
  if (e instanceof AIError) return { message: e.message, status: e.status };
  if (e instanceof Anthropic.AuthenticationError)
    return { message: "Clé API Anthropic absente ou invalide (variable ANTHROPIC_API_KEY).", status: 500 };
  if (e instanceof Anthropic.RateLimitError)
    return { message: "Limite de requêtes atteinte. Réessayez dans une minute.", status: 429 };
  if (e instanceof Anthropic.BadRequestError) return { message: `Requête invalide : ${e.message}`, status: 400 };
  if (e instanceof Anthropic.APIError) return { message: `Erreur du service IA (${e.status}).`, status: 502 };
  if (e instanceof Anthropic.AnthropicError && /api key|apiKey|authentication/i.test(e.message))
    return { message: "Clé API Anthropic absente (variable ANTHROPIC_API_KEY).", status: 500 };
  return { message: e instanceof Error ? e.message : "Erreur inconnue", status: 500 };
}
