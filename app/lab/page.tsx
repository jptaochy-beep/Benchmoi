"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ErrorBox, Loading, api, useProjects } from "@/components/ui";
import { BRIEF_FIELDS, emptyBrief } from "@/lib/brief";
import { FORMAT_GUIDE } from "@/lib/formats";
import type { Brief, Campaign, Project, Script, Territory } from "@/lib/types";

const FORMATS = Object.keys(FORMAT_GUIDE);
const RISK_COLOR = { faible: "text-ok", moyen: "text-warn", élevé: "text-accent" } as const;

function LabPage() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get("project") ?? "";
  const { projects } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brief, setBrief] = useState<Brief>(emptyBrief());
  const [count, setCount] = useState(6);
  const [direction, setDirection] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeScript, setActiveScript] = useState<string | null>(null);
  const [format, setFormat] = useState("TV 30 s");
  const [instruction, setInstruction] = useState("");
  const [viewVersion, setViewVersion] = useState<number | null>(null);

  async function load() {
    if (!projectId) return;
    const d = await api<{ project: Project; campaigns: Campaign[] }>(`/api/projects?id=${projectId}`);
    setProject(d.project);
    setCampaigns(d.campaigns);
    setBrief(d.project.brief ?? emptyBrief());
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function act(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const saveBrief = () =>
    act("Enregistrement du brief…", async () => {
      await api("/api/projects", { method: "PATCH", json: { id: projectId, brief } });
      await load();
    });

  const genTerritories = () =>
    act("Le directeur de création IA cherche des territoires…", async () => {
      await api("/api/projects", { method: "PATCH", json: { id: projectId, brief } });
      await api("/api/territories", { method: "POST", json: { projectId, count, direction } });
      await load();
    });

  const writeScript = (t: Territory, script?: Script) =>
    act(script ? "Révision du script…" : "Écriture du script…", async () => {
      const d = await api<{ script: Script }>("/api/script", {
        method: "POST",
        json: { projectId, territoryId: t.id, format, scriptId: script?.id, instruction },
      });
      setInstruction("");
      setActiveScript(d.script.id);
      setViewVersion(null);
      await load();
    });

  const removeTerritory = (t: Territory) =>
    act("Suppression…", async () => {
      await api(`/api/territories?projectId=${projectId}&id=${t.id}`, { method: "DELETE" });
      await load();
    });

  if (!projectId)
    return (
      <div className="card flex flex-col gap-3">
        <h1 className="text-2xl font-black">Creative Lab</h1>
        <p className="text-sm text-muted">Le Creative Lab travaille dans un projet : brief, benchmark, territoires et scripts y sont conservés.</p>
        <select className="input max-w-md" defaultValue="" onChange={(e) => router.push(`/lab?project=${e.target.value}`)}>
          <option value="" disabled>Choisir un projet…</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Link href="/projets" className="text-sm text-accent underline">Créer un projet</Link>
      </div>
    );
  if (!project) return error ? <ErrorBox error={error} /> : <Loading label="Chargement du projet…" />;

  const verifiedRefs = campaigns.filter((c) => c.verification.status !== "unconfirmed");
  const byId = Object.fromEntries(campaigns.map((c) => [c.id, c]));
  const script = project.scripts.find((s) => s.id === activeScript);
  const territoryOfScript = script && project.territories.find((t) => t.id === script.territoryId);
  const version = script && (script.versions.find((v) => v.n === viewVersion) ?? script.versions.at(-1));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-black">Creative Lab</h1>
        <Link href={`/projets/${project.id}`} className="text-sm text-accent underline">{project.name}</Link>
        <span className="text-xs text-muted">{verifiedRefs.length} référence(s) vérifiée(s) dans le benchmark</span>
      </header>

      {/* 1. Brief */}
      <section className="card flex flex-col gap-3">
        <h2 className="font-bold">1 · Brief client</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {BRIEF_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input className="input" value={brief[f.key]} placeholder={f.placeholder} onChange={(e) => setBrief({ ...brief, [f.key]: e.target.value })} />
            </div>
          ))}
        </div>
        <button className="btn-ghost self-start" onClick={saveBrief} disabled={!!busy}>Enregistrer le brief</button>
      </section>

      {/* 2. Benchmark */}
      <section className="card flex flex-col gap-2">
        <h2 className="font-bold">2 · Benchmark international</h2>
        {verifiedRefs.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune référence. <Link href="/" className="text-accent underline">Lancez une recherche</Link> en choisissant ce projet : les campagnes vérifiées alimenteront la création.
          </p>
        ) : (
          <ul className="grid gap-1 text-sm md:grid-cols-2">
            {verifiedRefs.map((c) => (
              <li key={c.id}><Link href={`/campagne/${c.id}`} className="hover:text-accent">{c.title}</Link> <span className="text-muted">— {c.brand}, {c.country}</span></li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Territoires */}
      <section className="flex flex-col gap-3">
        <div className="card flex flex-wrap items-end gap-3">
          <h2 className="w-full font-bold">3 · Territoires créatifs</h2>
          <div className="w-24">
            <label className="label">Nombre</label>
            <input type="number" min={3} max={10} className="input" value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </div>
          <div className="min-w-64 flex-1">
            <label className="label">Orientation (optionnel)</label>
            <input className="input" value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="ex. au moins une piste humour, une piste manifeste" />
          </div>
          <button className="btn" onClick={genTerritories} disabled={!!busy || !brief.brand}>
            {project.territories.length ? "Proposer d’autres territoires" : "Générer les territoires"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {project.territories.map((t, i) => (
            <article key={t.id} className="card flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-black text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="rounded bg-bg px-2 py-0.5 text-xs">{t.register}</span>
                <span className={`ml-auto text-xs ${RISK_COLOR[t.similarity_risk]}`} title={t.similarity_note}>ressemblance {t.similarity_risk}</span>
              </div>
              <h3 className="text-lg font-bold leading-tight">{t.title}</h3>
              <p className="text-sm">{t.synopsis}</p>
              <p className="text-xs text-muted"><b>Insight :</b> {t.insight}</p>
              <p className="text-xs text-muted"><b>Mécanique :</b> {t.mechanic}</p>
              <p className="text-xs"><b>Signature :</b> « {t.signature} »</p>
              {t.inspiration_campaign_ids.length > 0 && (
                <p className="text-xs text-muted">Inspiré de : {t.inspiration_campaign_ids.map((id) => byId[id]?.title ?? id).join(", ")}</p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <select className="input w-auto text-xs" value={format} onChange={(e) => setFormat(e.target.value)}>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
                <button className="btn text-xs" disabled={!!busy} onClick={() => writeScript(t)}>Écrire le script</button>
                <button className="btn-ghost text-xs" disabled={!!busy} onClick={() => removeTerritory(t)}>Écarter</button>
              </div>
              {project.scripts.filter((s) => s.territoryId === t.id).map((s) => (
                <button key={s.id} className="text-left text-xs text-accent underline" onClick={() => { setActiveScript(s.id); setViewVersion(null); }}>
                  Script {s.format} · v{s.versions.length}
                </button>
              ))}
            </article>
          ))}
        </div>
      </section>

      {busy && <Loading label={busy} />}
      <ErrorBox error={error} />

      {/* 4. Script Studio */}
      {script && version && territoryOfScript && (
        <section className="card flex flex-col gap-4" id="studio">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="font-bold">4 · Script Studio</h2>
            <span className="text-sm">{version.content.title} — {script.format}{version.content.duration ? ` · ${version.content.duration}` : ""}</span>
            <div className="ml-auto flex gap-1">
              {script.versions.map((v) => (
                <button key={v.n} className={`btn-ghost text-xs ${v.n === version.n ? "border-accent" : ""}`} onClick={() => setViewVersion(v.n)} title={v.instruction}>
                  v{v.n}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted">Consigne de la v{version.n} : {version.instruction} — {version.content.change_summary}</p>
          <p className="text-sm italic">{version.content.logline}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted">
                  <th className="w-24 py-1">{script.format === "Affichage" ? "Élément" : "Temps"}</th>
                  <th className="py-1">{script.format.startsWith("Radio") ? "Ambiance / sons" : "Image"}</th>
                  <th className="py-1">{script.format === "Affichage" ? "Texte" : "Son / voix / dialogues"}</th>
                </tr>
              </thead>
              <tbody>
                {version.content.rows.map((r, i) => (
                  <tr key={i} className="border-t border-line align-top">
                    <td className="py-2 pr-2 font-mono text-xs">{r.timecode}</td>
                    <td className="py-2 pr-3">{r.visual}</td>
                    <td className="whitespace-pre-line py-2">{r.audio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm"><b>Signature :</b> {version.content.tagline}</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="label">Chutes alternatives</div>
              <ol className="list-decimal pl-5 text-sm">{version.content.alternative_endings.map((x) => <li key={x}>{x}</li>)}</ol>
            </div>
            <div>
              <div className="label">Glossaire local</div>
              <ul className="text-sm">{version.content.glossary.map((g) => <li key={g.term}><b>{g.term}</b> : {g.meaning}</li>)}</ul>
              {version.content.glossary.length === 0 && <p className="text-sm text-muted">—</p>}
            </div>
            <div>
              <div className="label">Conformité</div>
              <ul className="list-disc pl-5 text-sm">{version.content.compliance_notes.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <div className={`rounded border border-line p-3 text-sm ${RISK_COLOR[version.content.similarity.risk]}`}>
            <b>Contrôle de ressemblance : {version.content.similarity.risk}</b>
            {version.content.similarity.closest_campaign_ids.length > 0 &&
              ` — proche de : ${version.content.similarity.closest_campaign_ids.map((id) => byId[id]?.title ?? id).join(", ")}`}
            <p className="text-ink">{version.content.similarity.explanation}</p>
          </div>
          <div className="no-print flex flex-col gap-2">
            <label className="label">Révision</label>
            <textarea className="input min-h-20" value={instruction} onChange={(e) => setInstruction(e.target.value)}
              placeholder="Développe en 45 secondes, rends le dialogue plus camerounais, propose deux chutes et supprime l’humour trop publicitaire." />
            <div className="flex gap-2">
              <button className="btn" disabled={!!busy || !instruction.trim()} onClick={() => writeScript(territoryOfScript, script)}>Créer la v{script.versions.length + 1}</button>
              <button className="btn-ghost" onClick={() => window.print()}>Imprimer / PDF</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LabPage />
    </Suspense>
  );
}
