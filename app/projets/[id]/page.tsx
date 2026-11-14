"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CampaignCard, ErrorBox, Loading, api } from "@/components/ui";
import { BRIEF_FIELDS } from "@/lib/brief";
import type { Campaign, Project, SearchRecord } from "@/lib/types";

/** Export Markdown du projet (benchmark sourcé + territoires + scripts). */
function toMarkdown(p: Project, campaigns: Campaign[]): string {
  const byId = Object.fromEntries(campaigns.map((c) => [c.id, c]));
  const verified = campaigns.filter((c) => c.verification.status !== "unconfirmed");
  const lines = [`# ${p.name}`, `Client : ${p.client} · Bureau : ${p.office}`, ""];
  if (p.brief) {
    lines.push("## Brief");
    BRIEF_FIELDS.forEach((f) => p.brief![f.key] && lines.push(`- **${f.label}** : ${p.brief![f.key]}`));
    lines.push("");
  }
  lines.push("## Benchmark (références vérifiées)");
  verified.forEach((c) =>
    lines.push(`- **${c.title}** — ${c.brand}${c.agency ? `, ${c.agency}` : ""}, ${c.country}${c.year ? `, ${c.year}` : ""}. ${c.summary} Source : ${c.sourceUrl ?? "interne"}`),
  );
  lines.push("", "## Territoires créatifs");
  p.territories.forEach((t, i) =>
    lines.push(`### ${String(i + 1).padStart(2, "0")} — ${t.title} (${t.register})`, t.synopsis, `- Insight : ${t.insight}`, `- Mécanique : ${t.mechanic}`, `- Signature : « ${t.signature} »`, ""),
  );
  lines.push("## Scripts");
  p.scripts.forEach((s) => {
    const v = s.versions.at(-1)!;
    lines.push(`### ${v.content.title} — ${s.format} (v${v.n})`, `_${v.content.logline}_`, "", "| Temps | Image | Son |", "|---|---|---|");
    v.content.rows.forEach((r) => lines.push(`| ${r.timecode} | ${r.visual.replace(/\|/g, "/")} | ${r.audio.replace(/\n/g, "<br>").replace(/\|/g, "/")} |`));
    lines.push("", `**Signature :** ${v.content.tagline}`, `Ressemblance : ${v.content.similarity.risk}${v.content.similarity.closest_campaign_ids.length ? ` (proche de ${v.content.similarity.closest_campaign_ids.map((id) => byId[id]?.title ?? id).join(", ")})` : ""}`, "");
  });
  return lines.join("\n");
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<{ project: Project; campaigns: Campaign[]; searches: SearchRecord[] } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => api<NonNullable<typeof data>>(`/api/projects?id=${id}`).then(setData).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!data) return error ? <ErrorBox error={error} /> : <Loading label="Chargement…" />;
  const { project: p, campaigns, searches } = data;
  const refs = campaigns.filter((c) => c.verification.status !== "unconfirmed");

  function exportMd() {
    const blob = new Blob([toMarkdown(p, campaigns)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${p.name.replace(/[^\p{L}\p{N}]+/gu, "_")}.md`;
    a.click();
  }

  async function remove() {
    if (!confirm(`Supprimer le projet « ${p.name} » ?`)) return;
    await api(`/api/projects?id=${p.id}`, { method: "DELETE" });
    router.push("/projets");
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-black">{p.name}</h1>
        <span className="text-sm text-muted">{p.client} · {p.office}</span>
        <div className="no-print ml-auto flex gap-2">
          <Link href={`/lab?project=${p.id}`} className="btn">Creative Lab</Link>
          <button className="btn-ghost" onClick={exportMd}>Exporter (Markdown)</button>
          <button className="btn-ghost" onClick={() => window.print()}>Imprimer / PDF</button>
          <button className="btn-ghost" onClick={remove}>Supprimer</button>
        </div>
      </header>

      <section className="card text-sm">
        <div className="label">Recherches du projet</div>
        {searches.length === 0 ? (
          <p className="text-muted">Aucune. <Link href="/" className="text-accent underline">Lancer une recherche</Link> en sélectionnant ce projet.</p>
        ) : (
          <ul>{searches.map((s) => <li key={s.id}><Link href={`/?s=${s.id}`} className="hover:text-accent">{s.query}</Link> <span className="text-xs text-muted">{s.createdAt.slice(0, 10)}</span></li>)}</ul>
        )}
      </section>

      {selected.length >= 2 && (
        <div className="no-print flex items-center gap-3 rounded-lg border border-accent bg-surface p-3 text-sm">
          {selected.length} sélectionnée(s)
          <button className="btn" onClick={() => router.push(`/comparer?ids=${selected.join(",")}`)}>Comparer les idées</button>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {refs.map((c) => (
          <CampaignCard key={c.id} c={c} selected={selected.includes(c.id)}
            onToggle={() => setSelected((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : s.length < 4 ? [...s, c.id] : s))} />
        ))}
      </section>

      {p.comparisons.length > 0 && (
        <section className="card text-sm">
          <div className="label">Comparaisons enregistrées</div>
          {p.comparisons.map((cmp) => (
            <div key={cmp.id} className="border-t border-line py-2">
              <b>{cmp.campaignIds.map((cid) => campaigns.find((c) => c.id === cid)?.title ?? cid).join(" · ")}</b>
              <p>Angle recommandé : {cmp.recommended_angle}</p>
            </div>
          ))}
        </section>
      )}

      <section className="card text-sm">
        <div className="label">Territoires et scripts</div>
        <p>{p.territories.length} territoire(s), {p.scripts.length} script(s) — <Link href={`/lab?project=${p.id}`} className="text-accent underline">ouvrir dans le Creative Lab</Link></p>
      </section>
    </div>
  );
}
