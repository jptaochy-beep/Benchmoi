import { normalizeUrl } from "./claude";
import type { Verification } from "./types";
import { now } from "./store";

/**
 * Vérification CÔTÉ SERVEUR — le modèle ne peut pas l'influencer.
 *  (a) l'URL fait partie des résultats réellement renvoyés par le moteur de recherche
 *  (b) l'URL n'est pas morte (pas de 404/410/erreur DNS)
 *  (c) la page mentionne la marque ou le titre (indice de confiance)
 * Vérifiée = (a) ET (b). (c) module le niveau de confiance.
 */
export async function verifyCampaignUrl(opts: {
  url: string | null;
  collected: Map<string, string>;
  fetchedTexts?: Map<string, string>;
  brand: string;
  title: string;
}): Promise<Verification & { sourceTitle: string | null }> {
  const reasons: string[] = [];
  if (!opts.url) {
    return {
      status: "unconfirmed",
      inSearchResults: false,
      httpStatus: null,
      pageMentionsCampaign: null,
      confidence: "faible",
      reasons: ["Aucune URL source fournie."],
      checkedAt: now(),
      sourceTitle: null,
    };
  }
  const key = normalizeUrl(opts.url);
  const inSearchResults = opts.collected.has(key);
  const sourceTitle = opts.collected.get(key) ?? null;
  if (!inSearchResults) reasons.push("URL absente des résultats réels du moteur de recherche.");

  let httpStatus: number | null = null;
  let body = opts.fetchedTexts?.get(key) ?? "";
  let dead = false;
  // On ne contacte que des URL issues du moteur de recherche (évite toute requête
  // vers une adresse arbitraire fournie par le modèle).
  if (inSearchResults) try {
    const res = await fetch(opts.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CreativeIntelligenceVerifier/0.1)" },
    });
    httpStatus = res.status;
    if (res.status === 404 || res.status === 410) dead = true;
    if (res.ok && !body) body = (await res.text()).slice(0, 400_000);
  } catch {
    reasons.push("Page injoignable depuis le serveur (réseau, protection anti-robot ou délai).");
  }
  if (dead) reasons.push(`Lien mort (HTTP ${httpStatus}).`);

  let pageMentionsCampaign: boolean | null = null;
  if (body) {
    const hay = body.toLowerCase();
    const brandHit = opts.brand.length > 1 && hay.includes(opts.brand.toLowerCase());
    const titleWords = opts.title
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 3);
    const titleHit = titleWords.length > 0 && titleWords.filter((w) => hay.includes(w)).length >= Math.ceil(titleWords.length / 2);
    pageMentionsCampaign = brandHit || titleHit;
    if (!pageMentionsCampaign) reasons.push("La page ne mentionne ni la marque ni le titre.");
  } else if (sourceTitle) {
    const t = sourceTitle.toLowerCase();
    pageMentionsCampaign = t.includes(opts.brand.toLowerCase()) || null;
  }

  const verified = inSearchResults && !dead && pageMentionsCampaign !== false;
  const confidence: Verification["confidence"] = !verified
    ? "faible"
    : pageMentionsCampaign && httpStatus !== null && httpStatus < 400
      ? "élevée"
      : "moyenne";
  if (verified && confidence === "moyenne")
    reasons.push("Lien issu du moteur de recherche ; contenu de la page non relu automatiquement.");

  return {
    status: verified ? "verified" : "unconfirmed",
    inSearchResults,
    httpStatus,
    pageMentionsCampaign,
    confidence,
    reasons,
    checkedAt: now(),
    sourceTitle,
  };
}

/** Une URL secondaire (prix, résultats) n'est conservée que si elle vient des outils. */
export function isCollected(url: string | null, collected: Map<string, string>): boolean {
  return !!url && collected.has(normalizeUrl(url));
}
