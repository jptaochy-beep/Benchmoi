import type { Brief, DB, Project } from "./types";

export const BRIEF_FIELDS: { key: keyof Brief; label: string; placeholder: string }[] = [
  { key: "brand", label: "Marque", placeholder: "Dangote Cement" },
  { key: "sector", label: "Secteur", placeholder: "BTP / ciment" },
  { key: "target", label: "Cible", placeholder: "Maçons, chefs de chantier, auto-constructeurs, 25-55 ans" },
  { key: "problem", label: "Problème", placeholder: "Le ciment est perçu comme une commodité ; seul le prix compte" },
  { key: "promise", label: "Promesse", placeholder: "Un ciment à la hauteur de la fierté du bâtisseur" },
  { key: "proof", label: "Preuve / RTB", placeholder: "Résistance certifiée, présence nationale" },
  { key: "tone", label: "Ton", placeholder: "Fier, chaleureux, sans grandiloquence" },
  { key: "budget", label: "Budget (fourchette)", placeholder: "Moyen — tournage local 2 jours" },
  { key: "market", label: "Marché", placeholder: "Cameroun (Douala, Yaoundé)" },
  { key: "media", label: "Médias", placeholder: "TV, radio, affichage, Facebook/TikTok" },
  { key: "mandatories", label: "Mandatories", placeholder: "Packshot sac 50 kg, logo final 3 s" },
  { key: "forbidden", label: "Interdits", placeholder: "Pas de comparaison concurrentielle" },
];

export const emptyBrief = (): Brief =>
  Object.fromEntries(BRIEF_FIELDS.map((f) => [f.key, ""])) as unknown as Brief;

export function briefText(b: Brief | null): string {
  if (!b) return "(aucun brief)";
  return BRIEF_FIELDS.filter((f) => b[f.key]?.trim())
    .map((f) => `${f.label} : ${b[f.key]}`)
    .join("\n");
}

/** Dossier de références du projet, à fournir au modèle pour la création. */
export function benchmarkDossier(db: DB, p: Project): string {
  const ids = new Set(p.campaignIds);
  for (const sid of p.searchIds) {
    const s = db.searches[sid];
    s?.results.forEach((r) => {
      if (db.campaigns[r.campaignId]?.verification.status === "verified") ids.add(r.campaignId);
    });
  }
  return (
    [...ids]
      .map((id) => {
        const c = db.campaigns[id];
        if (!c) return "";
        const a = db.analyses[id];
        return `<ref id="${c.id}">${c.title} — ${c.brand} (${c.country}, ${c.year ?? "?"}) : ${c.summary}${a ? ` | Insight : ${a.insight} | Idée : ${a.big_idea} | Mécanique : ${a.mechanic} | Chute : ${a.narrative.resolution} | Signature : ${a.narrative.signature}` : ""}</ref>`;
      })
      .filter(Boolean)
      .join("\n") || "(aucune référence dans le projet)"
  );
}
