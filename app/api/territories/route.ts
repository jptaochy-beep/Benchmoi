import { NextResponse } from "next/server";
import { BASE_SYSTEM, structured, toHttpError } from "@/lib/claude";
import { benchmarkDossier, briefText } from "@/lib/brief";
import { TerritoriesExtraction } from "@/lib/schemas";
import { mutateDB, newId, now, readDB } from "@/lib/store";
import type { Territory } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { projectId, count = 6, direction = "" } = (await req.json()) as {
      projectId: string;
      count?: number;
      direction?: string;
    };
    const db = await readDB();
    const p = db.projects[projectId];
    if (!p) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    if (!p.brief?.brand) return NextResponse.json({ error: "Renseignez d'abord le brief (au moins la marque)." }, { status: 400 });
    const n = Math.min(10, Math.max(3, Number(count) || 6));

    const ext = await structured({
      schema: TerritoriesExtraction,
      effort: "high",
      system: `${BASE_SYSTEM}

Tu es directeur de création. Tu proposes des territoires créatifs ORIGINAUX.
- Les références servent à comprendre les ressorts ; tu ne reprends jamais une exécution existante (même histoire, même chute, même signature).
- Varie les registres (émotion, humour, manifeste, documentaire, démonstration…).
- Chaque territoire doit être exécutable dans le budget et le marché indiqués, et parler vrai au public local.
- inspiration_campaign_ids : uniquement des ids de <ref> fournis.
- similarity_risk : ton évaluation honnête de la proximité avec les références.`,
      prompt: `<brief>
${briefText(p.brief)}
</brief>

<benchmark>
${benchmarkDossier(db, p)}
</benchmark>
${direction ? `\nOrientation demandée par l'équipe : ${direction}` : ""}
${p.territories.length ? `\nTerritoires déjà proposés (ne pas les répéter) :\n${p.territories.map((t) => `- ${t.title} : ${t.idea}`).join("\n")}` : ""}

Propose ${n} territoires créatifs.`,
    });

    const refIds = new Set(Object.keys(db.campaigns));
    const territories: Territory[] = ext.territories.map((t) => ({
      ...t,
      inspiration_campaign_ids: t.inspiration_campaign_ids.filter((id) => refIds.has(id)),
      id: newId("ter"),
    }));
    await mutateDB((d) => {
      d.projects[projectId].territories.push(...territories);
      d.projects[projectId].updatedAt = now();
    });
    return NextResponse.json({ territories });
  } catch (e) {
    const { message, status } = toHttpError(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId")!;
  const id = url.searchParams.get("id")!;
  await mutateDB((d) => {
    const p = d.projects[projectId];
    if (p) p.territories = p.territories.filter((t) => t.id !== id);
  });
  return NextResponse.json({ ok: true });
}
