import { NextResponse } from "next/server";
import { BASE_SYSTEM, structured, toHttpError } from "@/lib/claude";
import { ComparisonExtraction } from "@/lib/schemas";
import { mutateDB, newId, now, readDB } from "@/lib/store";
import type { Comparison } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { ids, brief, projectId } = (await req.json()) as { ids: string[]; brief?: string; projectId?: string };
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 4)
      return NextResponse.json({ error: "Sélectionnez 2 à 4 campagnes." }, { status: 400 });
    const db = await readDB();
    const items = ids.map((id) => ({ c: db.campaigns[id], a: db.analyses[id] })).filter((x) => x.c);
    if (items.length !== ids.length) return NextResponse.json({ error: "Campagne introuvable." }, { status: 404 });

    const dossier = items
      .map(
        ({ c, a }) => `<campagne id="${c.id}">
${c.title} — ${c.brand} (${c.country}, ${c.year ?? "?"}, ${c.sector}, ${c.format})
Résumé : ${c.summary}
${a ? `Insight : ${a.insight}\nBig idea : ${a.big_idea}\nMécanique : ${a.mechanic}\nNarration : ${a.narrative.hook} → ${a.narrative.development} → ${a.narrative.turn} → ${a.narrative.resolution} → ${a.narrative.signature}` : `Tags : ${JSON.stringify(c.tags)}`}
</campagne>`,
      )
      .join("\n");

    const ext = await structured({
      schema: ComparisonExtraction,
      system: BASE_SYSTEM,
      prompt: `Compare ces campagnes pour un concepteur-rédacteur.
${dossier}
${brief ? `\nBrief en cours : ${brief}` : ""}

Identifie ce qui les rapproche, ce qui distingue chacune (campaign_id = id fourni), les conventions du secteur, les clichés à éviter, les territoires encore peu exploités et l'angle que tu recommandes${brief ? " pour le brief" : ""}.`,
    });

    const comparison: Comparison = { ...ext, id: newId("cmpz"), campaignIds: ids, createdAt: now() };
    if (projectId) {
      await mutateDB((d) => {
        const p = d.projects[projectId];
        if (p) {
          p.comparisons.push(comparison);
          p.updatedAt = now();
        }
      });
    }
    return NextResponse.json({ comparison });
  } catch (e) {
    const { message, status } = toHttpError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
