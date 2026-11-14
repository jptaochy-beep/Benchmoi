import { NextResponse } from "next/server";
import { BASE_SYSTEM, structured, toHttpError } from "@/lib/claude";
import { benchmarkDossier, briefText } from "@/lib/brief";
import { ScriptExtraction } from "@/lib/schemas";
import { mutateDB, newId, now, readDB } from "@/lib/store";
import type { Script } from "@/lib/types";
import { FORMAT_GUIDE } from "@/lib/formats";

export const runtime = "nodejs";
export const maxDuration = 300;



export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      projectId: string;
      territoryId: string;
      format?: string;
      scriptId?: string;
      instruction?: string;
    };
    const db = await readDB();
    const p = db.projects[body.projectId];
    if (!p) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    const t = p.territories.find((x) => x.id === body.territoryId);
    if (!t) return NextResponse.json({ error: "Territoire introuvable." }, { status: 404 });

    const existing = body.scriptId ? p.scripts.find((s) => s.id === body.scriptId) : undefined;
    const format = existing?.format ?? body.format ?? "TV 30 s";
    const last = existing?.versions.at(-1);
    const instruction = body.instruction?.trim() || (last ? "Améliore cette version." : "Première version.");

    const content = await structured({
      schema: ScriptExtraction,
      effort: "high",
      system: `${BASE_SYSTEM}

Tu es concepteur-rédacteur senior. Tu écris des scripts produisibles, précis, rythmés, avec des dialogues qui sonnent juste pour le marché visé.
- Respecte les mandatories et interdits du brief, et la réglementation publicitaire locale ; signale tout risque dans compliance_notes.
- Si tu utilises des expressions locales (nouchi, camfranglais, wolof, pidgin…), ajoute-les au glossary avec leur sens.
- Propose 2 chutes alternatives (alternative_endings).
- similarity : compare honnêtement ton script aux <ref> du benchmark (structure narrative, chute, signature). closest_campaign_ids = ids de <ref> uniquement.
- Pas de marque concurrente citée.`,
      prompt: `<brief>
${briefText(p.brief)}
</brief>

<territoire>
${t.title} (${t.register})
Insight : ${t.insight}
Idée : ${t.idea}
Synopsis : ${t.synopsis}
Mécanique : ${t.mechanic}
Signature proposée : ${t.signature}
</territoire>

<benchmark>
${benchmarkDossier(db, p)}
</benchmark>

Format : ${format} — ${FORMAT_GUIDE[format] ?? format}

${last ? `<version_precedente n="${last.n}">\n${JSON.stringify(last.content, null, 1)}\n</version_precedente>\n\nConsigne de révision : ${instruction}` : `Consigne : ${instruction}`}`,
    });

    const script: Script = existing
      ? { ...existing, versions: [...existing.versions, { n: (last?.n ?? 0) + 1, instruction, content, createdAt: now() }] }
      : { id: newId("scr"), territoryId: t.id, format, versions: [{ n: 1, instruction, content, createdAt: now() }] };

    await mutateDB((d) => {
      const proj = d.projects[body.projectId];
      const i = proj.scripts.findIndex((s) => s.id === script.id);
      if (i >= 0) proj.scripts[i] = script;
      else proj.scripts.push(script);
      proj.updatedAt = now();
    });
    return NextResponse.json({ script });
  } catch (e) {
    const { message, status } = toHttpError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
