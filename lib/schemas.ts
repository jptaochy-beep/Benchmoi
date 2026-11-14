import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Schémas des sorties structurées demandées au modèle                  */
/* (nullable plutôt qu'optional : exigence des sorties structurées)     */
/* ------------------------------------------------------------------ */

export const RecognitionType = z.enum(["award", "popular", "effectiveness", "none"]);

export const SearchExtraction = z.object({
  interpretation: z
    .string()
    .describe("Reformulation de l'intention créative en une ou deux phrases, en français"),
  expanded_concepts: z
    .array(z.string())
    .describe("Concepts voisins explorés (ex. sacrifice → dévouement, héritage, gratitude)"),
  campaigns: z.array(
    z.object({
      title: z.string(),
      brand: z.string(),
      agency: z.string().nullable(),
      country: z.string(),
      year: z.string().nullable(),
      sector: z.string(),
      format: z.string().describe("ex. TV 60 s, film digital 3 min, print, affichage, radio"),
      source_url: z
        .string()
        .describe("URL EXACTE d'une page issue des résultats de recherche décrivant CETTE campagne"),
      media_url: z
        .string()
        .nullable()
        .describe("URL de la vidéo officielle (YouTube/Vimeo) si présente dans les résultats, sinon null"),
      summary: z.string().describe("Ce qui se passe dans la campagne, 2-3 phrases, en français"),
      relevance: z.string().describe("Pourquoi elle répond à la demande, 1 phrase, en français"),
      recognition_type: RecognitionType,
      recognition_detail: z.string().nullable(),
      recognition_source_url: z.string().nullable(),
      tags: z.object({
        insight: z.array(z.string()),
        emotion: z.array(z.string()),
        mechanic: z.array(z.string()),
        narrative_form: z.array(z.string()),
      }),
    }),
  ),
  internal_matches: z
    .array(z.object({ id: z.string(), relevance: z.string() }))
    .describe("Campagnes de la bibliothèque interne McCann pertinentes (ids fournis uniquement)"),
  synthesis: z.object({
    recurring_levers: z.array(z.string()).describe("Ressorts créatifs communs"),
    underexploited: z.array(z.string()).describe("Approches moins exploitées / opportunités"),
  }),
  not_found_note: z
    .string()
    .nullable()
    .describe("Si une campagne précise demandée est introuvable, le dire ici. Sinon null."),
});
export type SearchExtraction = z.infer<typeof SearchExtraction>;

export const AnalysisExtraction = z.object({
  confirmed_identity: z.object({
    title: z.string(),
    brand: z.string(),
    agency: z.string().nullable(),
    country: z.string(),
    year: z.string().nullable(),
    uncertain_fields: z.array(z.string()).describe("Champs d'identité non confirmés par une source"),
  }),
  insight: z.string(),
  big_idea: z.string(),
  mechanic: z.string(),
  narrative: z.object({
    hook: z.string(),
    development: z.string(),
    turn: z.string(),
    resolution: z.string(),
    signature: z.string(),
  }),
  tagline: z.string().nullable().describe("Uniquement si citée dans une source, sinon null"),
  credits: z.array(z.object({ role: z.string(), name: z.string() })),
  recognitions: z.array(
    z.object({ type: RecognitionType, detail: z.string(), source_url: z.string() }),
  ),
  effectiveness: z.object({
    status: z.enum(["documented", "not_available"]),
    detail: z.string().nullable(),
    source_url: z.string().nullable(),
  }),
  why_it_works: z.string(),
  transferable_lessons: z.array(z.string()).describe("Leçons transposables à d'autres secteurs"),
  sources: z.array(z.object({ url: z.string(), title: z.string() })),
});
export type AnalysisExtraction = z.infer<typeof AnalysisExtraction>;

export const ComparisonExtraction = z.object({
  common_ground: z.array(z.string()),
  differences: z.array(z.object({ campaign_id: z.string(), distinctive: z.string() })),
  category_conventions: z.array(z.string()),
  cliches_to_avoid: z.array(z.string()),
  underexploited_territories: z.array(z.string()),
  recommended_angle: z.string(),
});
export type ComparisonExtraction = z.infer<typeof ComparisonExtraction>;

export const TerritoriesExtraction = z.object({
  territories: z.array(
    z.object({
      title: z.string(),
      register: z.string().describe("Émotion, Humour, Manifeste, Documentaire…"),
      insight: z.string(),
      idea: z.string(),
      synopsis: z.string(),
      mechanic: z.string(),
      signature: z.string().describe("Proposition de signature / claim"),
      execution_potential: z.string(),
      inspiration_campaign_ids: z.array(z.string()),
      similarity_risk: z.enum(["faible", "moyen", "élevé"]),
      similarity_note: z.string(),
    }),
  ),
});
export type TerritoriesExtraction = z.infer<typeof TerritoriesExtraction>;

export const ScriptExtraction = z.object({
  title: z.string(),
  format: z.string(),
  duration: z.string().nullable(),
  logline: z.string(),
  rows: z
    .array(z.object({ timecode: z.string(), visual: z.string(), audio: z.string() }))
    .describe("TV/digital : plans. Radio : séquences (visual = ambiance/bruitages). Affichage : éléments"),
  tagline: z.string(),
  alternative_endings: z.array(z.string()),
  glossary: z.array(z.object({ term: z.string(), meaning: z.string() })),
  compliance_notes: z.array(z.string()),
  similarity: z.object({
    risk: z.enum(["faible", "moyen", "élevé"]),
    closest_campaign_ids: z.array(z.string()),
    explanation: z.string(),
  }),
  change_summary: z.string().describe("Ce qui a changé par rapport à la version précédente"),
});
export type ScriptExtraction = z.infer<typeof ScriptExtraction>;
