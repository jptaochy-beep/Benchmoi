"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CampaignCard, Chips, ErrorBox, Loading, api, useProjects } from "@/components/ui";
import { FILTERS, FILTER_LABELS } from "@/lib/filters";
import type { Campaign, SearchFilters, SearchRecord } from "@/lib/types";

type Hit = Campaign & { relevance: string };

const DEFAULT_FILTERS: SearchFilters = {
  region: "Monde entier",
  format: "Tous les formats",
  sector: "Tous",
  approach: "Toutes",
  emotion: "Toutes",
  insight: "Tous",
  mechanic: "Toutes",
  outOfCategory: false,
  africaFocus: false,
};

const EXAMPLES = [
  "Des publicités internationales qui parlent du sacrifice des parents pour leurs enfants, émouvantes, avec une révélation finale, film 60 secondes",
  "Publicités sur la fierté des artisans, le travail bien fait et la transmission entre générations",
  "Campagnes télécom africaines qui utilisent l'humour du quotidien et la débrouille",
];

function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const searchId = params.get("s");
  const { projects } = useProjects();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ search: SearchRecord; campaigns: Hit[]; internal: Hit[] } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [history, setHistory] = useState<{ id: string; query: string; createdAt: string; count: number }[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api<{ searches: typeof history }>("/api/search").then((d) => setHistory(d.searches)).catch(() => {});
  }, [searchId]);

  useEffect(() => {
    if (!searchId) return setData(null);
    api<NonNullable<typeof data>>(`/api/search?id=${searchId}`)
      .then((d) => {
        setData(d);
        setQuery(d.search.query);
        setFilters(d.search.filters);
      })
      .catch((e) => setError(e.message));
  }, [searchId]);

  async function run() {
    setLoading(true);
    setError(null);
    setSelected([]);
    try {
      const { searchId } = await api<{ searchId: string }>("/api/search", {
        method: "POST",
        json: { query, filters, projectId: projectId || undefined },
      });
      router.push(`/?s=${searchId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function addToProject() {
    if (!projectId) return setNotice("Choisissez un projet dans le formulaire de recherche.");
    await api("/api/projects", { method: "PATCH", json: { id: projectId, addCampaignIds: selected } });
    setNotice(`${selected.length} campagne(s) ajoutée(s) au projet.`);
  }

  const verified = data?.campaigns.filter((c) => c.verification.status === "verified") ?? [];
  const unconfirmed = data?.campaigns.filter((c) => c.verification.status !== "verified") ?? [];
  const countries = new Set(verified.map((c) => c.country));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s));

  return (
    <div className="flex flex-col gap-6">
      <section className="card flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-black">Que cherchez-vous ?</h1>
          <p className="text-sm text-muted">
            Décrivez une idée, une émotion, un ressort — pas des mots-clés. La recherche interroge le web en plusieurs langues
            et ne retient que des campagnes dont la source est vérifiable.
          </p>
        </div>
        <textarea
          className="input min-h-24"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={EXAMPLES[1]}
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} className="btn-ghost text-xs" onClick={() => setQuery(ex)}>
              {ex.slice(0, 60)}…
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(FILTERS) as (keyof typeof FILTERS)[]).map((k) => (
            <div key={k}>
              <label className="label">{FILTER_LABELS[k]}</label>
              <select
                className="input"
                value={filters[k] as string}
                onChange={(e) => setFilters({ ...filters, [k]: e.target.value })}
              >
                {FILTERS[k].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className="label">Projet (optionnel)</label>
            <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">— Aucun —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.outOfCategory}
              onChange={(e) => setFilters({ ...filters, outOfCategory: e.target.checked })}
            />
            Inspiration hors catégorie
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.africaFocus}
              onChange={(e) => setFilters({ ...filters, africaFocus: e.target.checked })}
            />
            Focus Afrique
          </label>
          <button className="btn ml-auto" disabled={loading || !query.trim()} onClick={run}>
            {loading ? "Benchmark en cours…" : "Lancer un benchmark"}
          </button>
        </div>
      </section>

      {loading && <Loading label="Recherche multilingue, extraction et vérification des sources… (30 s à 2 min)" />}
      <ErrorBox error={error} />

      {data && (
        <>
          <section className="card flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-lg font-bold">Benchmark</h2>
              <span className="text-xs text-muted">
                {verified.length} vérifiée(s) · {countries.size} pays · {data.search.collectedUrlCount} sources consultées ·{" "}
                {data.search.rejectedCount} écartée(s) · {Math.round(data.search.durationMs / 1000)} s
              </span>
            </div>
            <p className="text-sm">{data.search.interpretation}</p>
            <Chips items={data.search.expandedConcepts} />
            {data.search.notFoundNote && (
              <p className="rounded bg-warn-bg p-2 text-sm text-warn">{data.search.notFoundNote}</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="label">Ressorts communs</div>
                <ul className="list-disc pl-5 text-sm">
                  {data.search.synthesis.recurring_levers.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="label">Approches moins exploitées</div>
                <ul className="list-disc pl-5 text-sm">
                  {data.search.synthesis.underexploited.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {selected.length > 0 && (
            <div className="no-print sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-accent bg-surface p-3 text-sm">
              {selected.length} sélectionnée(s)
              <button
                className="btn"
                disabled={selected.length < 2}
                onClick={() => router.push(`/comparer?ids=${selected.join(",")}`)}
              >
                Comparer les idées
              </button>
              <button className="btn-ghost" onClick={addToProject}>
                Ajouter au projet
              </button>
              {notice && <span className="text-muted">{notice}</span>}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {verified.map((c) => (
              <CampaignCard
                key={c.id}
                c={c}
                relevance={c.relevance}
                selected={selected.includes(c.id)}
                onToggle={() => toggle(c.id)}
              />
            ))}
            {verified.length === 0 && (
              <p className="text-sm text-muted">Aucune campagne n’a pu être vérifiée. Reformulez ou élargissez les filtres.</p>
            )}
          </section>

          {data.internal.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">Dans la bibliothèque McCann</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.internal.map((c) => (
                  <CampaignCard key={c.id} c={c} relevance={c.relevance} />
                ))}
              </div>
            </section>
          )}

          {unconfirmed.length > 0 && (
            <details className="card">
              <summary className="cursor-pointer text-sm font-semibold text-warn">
                Pistes à vérifier — ne pas citer comme références ({unconfirmed.length})
              </summary>
              <p className="my-2 text-xs text-muted">
                Ces campagnes ont été mentionnées pendant la recherche mais leur source n’a pas passé la vérification
                automatique. Elles ne sont pas utilisées par le Creative Lab.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {unconfirmed.map((c) => (
                  <div key={c.id} className="flex flex-col gap-1">
                    <CampaignCard c={c} relevance={c.relevance} />
                    <p className="text-xs text-muted">{c.verification.reasons.join(" ")}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {!data && history.length > 0 && (
        <section className="card">
          <div className="label">Recherches récentes</div>
          <ul className="flex flex-col gap-1 text-sm">
            {history.map((h) => (
              <li key={h.id}>
                <button className="text-left hover:text-accent" onClick={() => router.push(`/?s=${h.id}`)}>
                  {h.query} <span className="text-xs text-muted">· {h.count} résultats · {h.createdAt.slice(0, 10)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
