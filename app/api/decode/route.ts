import { NextResponse } from "next/server";
import { BASE_SYSTEM, MODEL, research, structured, toHttpError } from "@/lib/claude";
import { AnalysisExtraction } from "@/lib/schemas";
import { mutateDB, now, readDB } from "@/lib/store";
import type { Analysis } from "@/lib/types";
import { isCollected } from "@/lib/verify";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const db = await readDB();
  const campaign = id ? db.campaigns[id] : undefined;
  if (!campaign) return NextResponse.json({ error: "Campagne introuvable." }, { status: 404 });
  return NextResponse.json({ campaign, analysis: db.analyses[campaign.id] ?? null });
}

export async function POST(req: Request) {
  try {
    const { id } = (await req.json()) as { id: string };
    const db = await readDB();
    const c = db.campaigns[id];
    if (!c) return NextResponse.json({ error: "Campagne introuvable." }, { status: 404 });

    const identity = `« ${c.title} » — ${c.brand}${c.agency ? `, agence ${c.agency}` : ""}, ${c.country}${c.year ? `, ${c.year}` : ""}, ${c.format}`;
    const isInternal = c.sourceType === "internal";

    let notes = c.summary;
    let urls = new Map<string, string>();
    if (!isInternal) {
      const r = await research({
        system: `${BASE_SYSTEM}

Ta mission ici : DÉCODER une campagne. Lis la page source, puis cherche des informations complémentaires : description détaillée du film/visuel, crédits (agence, réalisateur, production), prix obtenus, résultats d'efficacité documentés (Effie, études de cas). Termine par une note détaillée en citant l'URL de chaque fait.`,
        prompt: `Campagne : ${identity}
Page source à lire en premier : ${c.sourceUrl}
${c.mediaUrl ? `Vidéo : ${c.mediaUrl}` : ""}
Résumé connu : ${c.summary}`,
        maxSearches: 5,
        allowFetch: true,
        effort: "medium",
      });
      notes = r.notes;
      urls = r.urls;
    }

    const urlList = [...urls.entries()].map(([u, t]) => `- https://${u}  — ${t}`).join("\n");
    const ext = await structured({
      schema: AnalysisExtraction,
      system: BASE_SYSTEM,
      prompt: `Campagne à décoder : ${identity}
${isInternal ? "(Campagne interne McCann — pas de source web ; analyse à partir de la description.)" : ""}

<note_de_recherche>
${notes}
</note_de_recherche>

<urls_collectees>
${urlList || "(aucune)"}
</urls_collectees>

Produis la fiche d'intelligence créative.
- insight, big_idea, mechanic, narrative, why_it_works, transferable_lessons : ton ANALYSE d'expert (concise, précise, utile à un concepteur-rédacteur).
- tagline, credits, recognitions, effectiveness : UNIQUEMENT des faits présents dans la note, avec une URL de la liste. Sinon tableau vide / null / "not_available".
- sources : uniquement des URL de la liste.
- uncertain_fields : les champs d'identité qu'aucune source ne confirme.`,
    });

    // Filtre serveur : aucun fait sourcé sans URL réellement collectée
    if (!isInternal) {
      ext.recognitions = ext.recognitions.filter((x) => isCollected(x.source_url, urls));
      ext.sources = ext.sources.filter((x) => isCollected(x.url, urls));
      if (ext.effectiveness.status === "documented" && !isCollected(ext.effectiveness.source_url, urls)) {
        ext.effectiveness = { status: "not_available", detail: null, source_url: null };
      }
      if (c.sourceUrl && !ext.sources.some((s) => s.url === c.sourceUrl)) {
        ext.sources.unshift({ url: c.sourceUrl, title: c.sourceTitle ?? "Source d'origine" });
      }
    }

    const analysis: Analysis = { ...ext, campaignId: c.id, createdAt: now(), model: MODEL };
    await mutateDB((d) => {
      d.analyses[c.id] = analysis;
    });
    return NextResponse.json({ analysis });
  } catch (e) {
    const { message, status } = toHttpError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
