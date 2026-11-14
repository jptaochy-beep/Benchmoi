"use client";

import { use, useEffect, useState } from "react";
import { Chips, ErrorBox, Loading, RecognitionBadge, VerificationBadge, api } from "@/components/ui";
import type { Analysis, Campaign } from "@/lib/types";
import { youtubeEmbed } from "@/lib/verify-client";

const RECO_LABEL = { award: "Prix", popular: "Audience", effectiveness: "Efficacité", none: "—" } as const;

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ campaign: Campaign; analysis: Analysis | null }>(`/api/decode?id=${id}`)
      .then((d) => {
        setCampaign(d.campaign);
        setAnalysis(d.analysis);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function decode() {
    setLoading(true);
    setError(null);
    try {
      const d = await api<{ analysis: Analysis }>("/api/decode", { method: "POST", json: { id } });
      setAnalysis(d.analysis);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!campaign) return error ? <ErrorBox error={error} /> : <Loading label="Chargement…" />;
  const embed = youtubeEmbed(campaign.mediaUrl) ?? youtubeEmbed(campaign.sourceUrl);
  const canCite = campaign.verification.status !== "unconfirmed";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <VerificationBadge c={campaign} />
          <RecognitionBadge c={campaign} />
        </div>
        <h1 className="text-2xl font-black">{campaign.title}</h1>
        <div className="text-sm text-muted">
          {campaign.brand}
          {campaign.agency ? ` · ${campaign.agency}` : ""} · {campaign.country}
          {campaign.year ? ` · ${campaign.year}` : ""} · {campaign.sector} · {campaign.format}
        </div>
        {!canCite && (
          <p className="rounded bg-warn-bg p-2 text-sm text-warn">
            Source non confirmée : {campaign.verification.reasons.join(" ")} Ne pas présenter cette campagne comme référence.
          </p>
        )}
      </header>

      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="card">
          {embed ? (
            <div className="aspect-video w-full overflow-hidden rounded">
              <iframe src={embed} className="h-full w-full" allowFullScreen title={campaign.title} />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded bg-bg text-sm text-muted">
              Lecteur indisponible —{" "}
              {campaign.sourceUrl ? (
                <a className="ml-1 text-accent underline" href={campaign.sourceUrl} target="_blank" rel="noreferrer">
                  voir la campagne à la source
                </a>
              ) : (
                "pas de média"
              )}
            </div>
          )}
          <p className="mt-3 text-sm">{campaign.summary}</p>
        </div>
        <div className="card flex flex-col gap-3 text-sm">
          <div>
            <div className="label">Source</div>
            {campaign.sourceUrl ? (
              <a href={campaign.sourceUrl} target="_blank" rel="noreferrer" className="break-all text-accent underline">
                {campaign.sourceTitle ?? campaign.sourceUrl}
              </a>
            ) : (
              "—"
            )}
            <div className="text-xs text-muted">Vérifiée le {campaign.verification.checkedAt.slice(0, 10)}</div>
          </div>
          <div>
            <div className="label">Reconnaissance</div>
            {campaign.recognitionDetail ? (
              <>
                {campaign.recognitionDetail}{" "}
                {campaign.recognitionSourceUrl && (
                  <a href={campaign.recognitionSourceUrl} className="text-accent underline" target="_blank" rel="noreferrer">
                    (source)
                  </a>
                )}
              </>
            ) : (
              <span className="text-muted">Non disponible</span>
            )}
          </div>
          <div>
            <div className="label">Tags</div>
            <Chips items={[...campaign.tags.insight, ...campaign.tags.emotion, ...campaign.tags.mechanic, ...campaign.tags.narrative_form]} />
          </div>
          <button className="btn no-print mt-2 self-start" disabled={loading} onClick={decode}>
            {analysis ? "Relancer l’analyse" : "Décoder cette campagne"}
          </button>
        </div>
      </div>

      {loading && <Loading label="Lecture de la source, recherche des crédits, prix et résultats…" />}
      <ErrorBox error={error} />

      {analysis && (
        <section className="card flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Fiche d’intelligence créative</h2>
            <span className="text-xs text-muted">
              Analyse IA du {analysis.createdAt.slice(0, 10)} — interprétation, à relire
            </span>
          </div>
          {analysis.confirmed_identity.uncertain_fields.length > 0 && (
            <p className="text-xs text-warn">À confirmer : {analysis.confirmed_identity.uncertain_fields.join(", ")}</p>
          )}
          <table className="w-full text-sm">
            <tbody className="[&_td]:border-t [&_td]:border-line [&_td]:py-2 [&_td]:align-top [&_th]:border-t [&_th]:border-line [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:align-top [&_th]:text-muted">
              <tr><th className="w-40">Insight</th><td>{analysis.insight}</td></tr>
              <tr><th>Big Idea</th><td className="font-semibold">{analysis.big_idea}</td></tr>
              <tr><th>Mécanique</th><td>{analysis.mechanic}</td></tr>
              <tr><th>Accroche</th><td>{analysis.narrative.hook}</td></tr>
              <tr><th>Développement</th><td>{analysis.narrative.development}</td></tr>
              <tr><th>Bascule</th><td>{analysis.narrative.turn}</td></tr>
              <tr><th>Résolution</th><td>{analysis.narrative.resolution}</td></tr>
              <tr><th>Signature</th><td>{analysis.narrative.signature}</td></tr>
              <tr><th>Claim (sourcé)</th><td>{analysis.tagline ?? <span className="text-muted">Non disponible</span>}</td></tr>
              <tr><th>Pourquoi ça marche</th><td>{analysis.why_it_works}</td></tr>
              <tr>
                <th>Leçons transposables</th>
                <td><ul className="list-disc pl-5">{analysis.transferable_lessons.map((l) => <li key={l}>{l}</li>)}</ul></td>
              </tr>
              <tr>
                <th>Reconnaissances</th>
                <td>
                  {analysis.recognitions.length ? (
                    <ul>
                      {analysis.recognitions.map((r) => (
                        <li key={r.detail}>
                          <b>{RECO_LABEL[r.type]}</b> — {r.detail}{" "}
                          <a href={r.source_url} className="text-accent underline" target="_blank" rel="noreferrer">source</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">Non disponibles</span>
                  )}
                </td>
              </tr>
              <tr>
                <th>Efficacité</th>
                <td>
                  {analysis.effectiveness.status === "documented" ? (
                    <>
                      {analysis.effectiveness.detail}{" "}
                      <a href={analysis.effectiveness.source_url!} className="text-accent underline" target="_blank" rel="noreferrer">source</a>
                    </>
                  ) : (
                    <span className="text-muted">Résultats non disponibles</span>
                  )}
                </td>
              </tr>
              {analysis.credits.length > 0 && (
                <tr>
                  <th>Crédits</th>
                  <td>{analysis.credits.map((c) => `${c.role} : ${c.name}`).join(" · ")}</td>
                </tr>
              )}
              <tr>
                <th>Sources</th>
                <td>
                  <ul>
                    {analysis.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} className="break-all text-accent underline" target="_blank" rel="noreferrer">{s.title}</a>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          <button className="btn-ghost no-print self-start" onClick={() => window.print()}>
            Imprimer / PDF
          </button>
        </section>
      )}
    </div>
  );
}
