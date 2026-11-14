import { NextResponse } from "next/server";
import { BASE_SYSTEM, research, structured, toHttpError } from "@/lib/claude";
import { SearchExtraction } from "@/lib/schemas";
import { mutateDB, newId, now, readDB, stableId } from "@/lib/store";
import type { Campaign, SearchFilters, SearchRecord } from "@/lib/types";
import { isCollected, verifyCampaignUrl } from "@/lib/verify";

export const runtime = "nodejs";
export const maxDuration = 300;

const AFRICA_SOURCES =
  "loeries.com, pitcherfestival.com (Pitcher Awards), adsoftheworld.com (filtre Afrique), brandcomunicator, marketingmag Afrique, campaignbrief, lbbonline.com, muse by Clio, presse marketing nigériane, sud-africaine, kényane, ivoirienne, camerounaise et sénégalaise";

function describeFilters(f: SearchFilters): string {
  const parts: string[] = [];
  if (f.region && f.region !== "Monde entier") parts.push(`Zone : ${f.region}`);
  if (f.format && f.format !== "Tous les formats") parts.push(`Format : ${f.format}`);
  if (f.sector && f.sector !== "Tous") parts.push(`Secteur : ${f.sector}`);
  if (f.approach && f.approach !== "Toutes") parts.push(`Approche créative : ${f.approach}`);
  if (f.emotion && f.emotion !== "Toutes") parts.push(`Émotion : ${f.emotion}`);
  if (f.insight && f.insight !== "Tous") parts.push(`Insight humain : ${f.insight}`);
  if (f.mechanic && f.mechanic !== "Toutes") parts.push(`Mécanique : ${f.mechanic}`);
  if (f.outOfCategory)
    parts.push(
      `INSPIRATION HORS CATÉGORIE : exclure le secteur${f.sector && f.sector !== "Tous" ? ` « ${f.sector} »` : " du brief"} et chercher le même ressort créatif dans des secteurs totalement différents.`,
    );
  if (f.africaFocus) parts.push(`FOCUS AFRIQUE : au moins la moitié des campagnes doivent être africaines. Sources utiles : ${AFRICA_SOURCES}.`);
  return parts.length ? parts.join("\n") : "Aucun filtre (monde entier, tous formats).";
}

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const { query, filters, projectId } = (await req.json()) as {
      query: string;
      filters: SearchFilters;
      projectId?: string;
    };
    if (!query?.trim()) return NextResponse.json({ error: "Requête vide." }, { status: 400 });

    const db = await readDB();
    const internal = Object.values(db.campaigns).filter((c) => c.sourceType === "internal");

    // 1+2. Expansion d'intention + recherche web outillée
    const r = await research({
      system: `${BASE_SYSTEM}

Ta mission ici : BENCHMARK. Trouver des campagnes publicitaires RÉELLES qui répondent à l'IDÉE demandée, même si elles n'emploient jamais les mots de la requête.
Méthode :
1. Reformule l'intention et élargis-la à des concepts voisins.
2. Lance des recherches variées, en anglais, espagnol, portugais, et dans d'autres langues si pertinent (thaï, hindi…). Pense aux archives : adsoftheworld.com, lovethework.com, dandad.org, adforum.com, shots.net, loeries.com, Pitcher Awards, campaignlive, adweek, lbbonline, musebyclio, YouTube.
3. Vise la diversité géographique (Thaïlande, Inde, Brésil, Afrique du Sud, Nigeria, Argentine, Europe…).
4. Pour chaque campagne retenue, assure-toi d'avoir un résultat de recherche qui décrit précisément CETTE campagne. Cherche aussi sa vidéo officielle.
5. Termine par une note de recherche listant chaque campagne trouvée avec : titre, marque, agence, pays, année, format, URL source exacte, URL vidéo, prix/résultats avec leur URL source.`,
      prompt: `Demande du créatif :
"""${query}"""

Filtres :
${describeFilters(filters)}

Trouve 8 à 12 campagnes réelles.`,
      maxSearches: 12,
      effort: "medium",
    });

    // 3. Extraction structurée — contrainte à la liste d'URL collectées
    const urlList = [...r.urls.entries()].map(([u, t]) => `- https://${u}  — ${t}`).join("\n");
    const ext = await structured({
      schema: SearchExtraction,
      system: BASE_SYSTEM,
      prompt: `Voici la note de recherche produite à partir de recherches web réelles :
<note>
${r.notes}
</note>

Voici la liste EXHAUSTIVE des URL réellement renvoyées par le moteur de recherche :
<urls>
${urlList || "(aucune)"}
</urls>

Bibliothèque interne McCann (ids utilisables dans internal_matches) :
<internal>
${internal.map((c) => `- ${c.id} : ${c.title} — ${c.brand} (${c.year ?? "?"}, ${c.office ?? ""}) — ${c.summary}`).join("\n") || "(vide)"}
</internal>

Demande initiale : """${query}"""
Filtres : ${describeFilters(filters)}

Produis le benchmark structuré.
- source_url, media_url et recognition_source_url DOIVENT être copiées depuis la liste <urls>. Si aucune URL de la liste ne décrit la campagne, ne l'inclus pas.
- recognition_type = "award" seulement si un prix précis est sourcé ; "effectiveness" seulement si des résultats business sont sourcés ; "popular" si une audience est sourcée ; sinon "none".
- Si la demande vise une campagne précise introuvable, explique-le dans not_found_note.`,
    });

    // 4. Vérification serveur
    const campaigns: Campaign[] = [];
    let rejected = 0;
    const results: SearchRecord["results"] = [];
    await Promise.all(
      ext.campaigns.map(async (c) => {
        const v = await verifyCampaignUrl({
          url: c.source_url,
          collected: r.urls,
          fetchedTexts: r.fetchedTexts,
          brand: c.brand,
          title: c.title,
        });
        if (v.status !== "verified") rejected++;
        const recognitionOk = isCollected(c.recognition_source_url, r.urls);
        const { sourceTitle, ...verification } = v;
        const campaign: Campaign = {
          id: stableId("cmp", `${c.brand}|${c.title}`.toLowerCase()),
          title: c.title,
          brand: c.brand,
          agency: c.agency,
          country: c.country,
          year: c.year,
          sector: c.sector,
          format: c.format,
          sourceUrl: c.source_url,
          sourceTitle,
          mediaUrl: isCollected(c.media_url, r.urls) ? c.media_url : null,
          summary: c.summary,
          recognitionType: recognitionOk ? c.recognition_type : "none",
          recognitionDetail: recognitionOk ? c.recognition_detail : null,
          recognitionSourceUrl: recognitionOk ? c.recognition_source_url : null,
          tags: c.tags,
          sourceType: "web",
          verification,
          createdAt: now(),
        };
        campaigns.push(campaign);
        results.push({ campaignId: campaign.id, relevance: c.relevance });
      }),
    );

    const internalIds = new Set(internal.map((c) => c.id));
    const record: SearchRecord = {
      id: newId("srch"),
      query,
      filters,
      interpretation: ext.interpretation,
      expandedConcepts: ext.expanded_concepts,
      results,
      internalMatches: ext.internal_matches
        .filter((m) => internalIds.has(m.id))
        .map((m) => ({ campaignId: m.id, relevance: m.relevance })),
      synthesis: ext.synthesis,
      notFoundNote: ext.not_found_note,
      collectedUrlCount: r.urls.size,
      rejectedCount: rejected,
      durationMs: Date.now() - started,
      createdAt: now(),
    };

    await mutateDB((d) => {
      for (const c of campaigns) {
        const prev = d.campaigns[c.id];
        // ne jamais rétrograder une campagne déjà vérifiée par une recherche moins fructueuse
        d.campaigns[c.id] = prev?.verification.status === "verified" && c.verification.status !== "verified" ? prev : c;
      }
      d.searches[record.id] = record;
      if (projectId && d.projects[projectId]) {
        d.projects[projectId].searchIds.push(record.id);
        d.projects[projectId].updatedAt = now();
      }
    });

    return NextResponse.json({ searchId: record.id });
  } catch (e) {
    const { message, status } = toHttpError(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const db = await readDB();
  if (!id) {
    const list = Object.values(db.searches)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 30)
      .map(({ id, query, createdAt, results }) => ({ id, query, createdAt, count: results.length }));
    return NextResponse.json({ searches: list });
  }
  const s = db.searches[id];
  if (!s) return NextResponse.json({ error: "Recherche introuvable." }, { status: 404 });
  const pick = (cid: string) => db.campaigns[cid];
  return NextResponse.json({
    search: s,
    campaigns: s.results.map((r) => ({ ...pick(r.campaignId), relevance: r.relevance })).filter((c) => c.id),
    internal: s.internalMatches.map((r) => ({ ...pick(r.campaignId), relevance: r.relevance })).filter((c) => c.id),
  });
}
