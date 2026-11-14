"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ErrorBox, Loading, VerificationBadge, api, useProjects } from "@/components/ui";
import type { Campaign, Comparison } from "@/lib/types";

function ComparePage() {
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const { projects } = useProjects();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brief, setBrief] = useState("");
  const [projectId, setProjectId] = useState("");
  const [result, setResult] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(ids.map((id) => api<{ campaign: Campaign }>(`/api/decode?id=${id}`).then((d) => d.campaign)))
      .then(setCampaigns)
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const d = await api<{ comparison: Comparison }>("/api/compare", {
        method: "POST",
        json: { ids, brief, projectId: projectId || undefined },
      });
      setResult(d.comparison);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (ids.length < 2)
    return (
      <div className="card text-sm">
        Sélectionnez 2 à 4 campagnes dans les <Link href="/" className="text-accent underline">résultats de recherche</Link> ou dans un projet, puis cliquez sur « Comparer les idées ».
      </div>
    );

  const byId = Object.fromEntries(campaigns.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-black">Comparer les idées</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {campaigns.map((c) => (
          <div key={c.id} className="card flex flex-col gap-1">
            <VerificationBadge c={c} />
            <Link href={`/campagne/${c.id}`} className="font-bold hover:text-accent">{c.title}</Link>
            <div className="text-xs text-muted">{c.brand} · {c.country} · {c.year ?? "?"}</div>
          </div>
        ))}
      </div>
      <div className="card grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
        <div>
          <label className="label">Brief en cours (optionnel)</label>
          <input className="input" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Assurance vie, Cameroun, cible parents 30-45 ans" />
        </div>
        <div>
          <label className="label">Enregistrer dans le projet</label>
          <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">— Aucun —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button className="btn" onClick={run} disabled={loading}>Comparer</button>
      </div>
      {loading && <Loading label="Analyse comparative…" />}
      <ErrorBox error={error} />
      {result && (
        <section className="grid gap-4 md:grid-cols-2">
          <Block title="Ce qui les rapproche" items={result.common_ground} />
          <div className="card">
            <div className="label">Ce qui les distingue</div>
            <ul className="flex flex-col gap-2 text-sm">
              {result.differences.map((d) => (
                <li key={d.campaign_id}><b>{byId[d.campaign_id]?.title ?? d.campaign_id}</b> — {d.distinctive}</li>
              ))}
            </ul>
          </div>
          <Block title="Conventions du secteur" items={result.category_conventions} />
          <Block title="Clichés à éviter" items={result.cliches_to_avoid} />
          <Block title="Territoires peu exploités" items={result.underexploited_territories} />
          <div className="card border-accent">
            <div className="label">Angle recommandé</div>
            <p className="text-sm">{result.recommended_angle}</p>
          </div>
        </section>
      )}
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card">
      <div className="label">{title}</div>
      <ul className="list-disc pl-5 text-sm">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ComparePage />
    </Suspense>
  );
}
