"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBox, api, useProjects } from "@/components/ui";
import type { Campaign, Confidentiality, Project } from "@/lib/types";

const CONF: Record<Confidentiality, string> = {
  reseau: "Public réseau",
  bureau: "Bureau",
  equipe: "Équipe projet",
  confidentiel: "Confidentiel client",
};
const OFFICES: Project["office"][] = ["Abidjan", "Douala", "Dakar", "Réseau"];

export default function ProjectsPage() {
  const { projects, reload } = useProjects();
  const [form, setForm] = useState({ name: "", client: "", office: "Abidjan" as Project["office"], confidentiality: "equipe" as Confidentiality });
  const [lib, setLib] = useState<Campaign[]>([]);
  const [item, setItem] = useState({ title: "", brand: "", year: "", sector: "", format: "", office: "Abidjan", confidentiality: "bureau" as Confidentiality, url: "", summary: "" });
  const [error, setError] = useState<string | null>(null);

  const loadLib = () => api<{ items: Campaign[] }>("/api/library").then((d) => setLib(d.items));
  useEffect(() => {
    loadLib().catch(() => {});
  }, []);

  async function create() {
    setError(null);
    try {
      await api("/api/projects", { method: "POST", json: form });
      setForm({ ...form, name: "", client: "" });
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function addItem() {
    setError(null);
    try {
      await api("/api/library", { method: "POST", json: item });
      setItem({ ...item, title: "", brand: "", year: "", url: "", summary: "" });
      loadLib();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black">Mes projets</h1>
      <ErrorBox error={error} />
      <section className="card grid gap-3 md:grid-cols-5 md:items-end">
        <div className="md:col-span-2">
          <label className="label">Nouveau projet</label>
          <input className="input" placeholder="Dangote — Fierté du bâtisseur" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Client</label>
          <input className="input" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
        </div>
        <div>
          <label className="label">Bureau</label>
          <select className="input" value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value as Project["office"] })}>
            {OFFICES.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Confidentialité</label>
          <select className="input" value={form.confidentiality} onChange={(e) => setForm({ ...form, confidentiality: e.target.value as Confidentiality })}>
            {Object.entries(CONF).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button className="btn md:col-span-5 md:justify-self-start" onClick={create} disabled={!form.name.trim()}>Créer le projet</button>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="card flex flex-col gap-1">
            <Link href={`/projets/${p.id}`} className="font-bold hover:text-accent">{p.name}</Link>
            <div className="text-xs text-muted">{p.client || "—"} · {p.office} · {CONF[p.confidentiality]}</div>
            <div className="text-xs text-muted">
              {p.searchIds.length} recherche(s) · {p.territories.length} territoire(s) · {p.scripts.length} script(s) · maj {p.updatedAt.slice(0, 10)}
            </div>
            <Link href={`/lab?project=${p.id}`} className="mt-2 text-sm text-accent underline">Ouvrir dans le Creative Lab</Link>
          </div>
        ))}
        {projects.length === 0 && <p className="text-sm text-muted">Aucun projet pour l’instant.</p>}
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="text-lg font-bold">Bibliothèque McCann</h2>
        <p className="text-sm text-muted">
          Déposez les campagnes finalisées, scripts et références des bureaux. Elles remontent dans les recherches et peuvent être décodées.
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          <input className="input" placeholder="Titre *" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
          <input className="input" placeholder="Marque *" value={item.brand} onChange={(e) => setItem({ ...item, brand: e.target.value })} />
          <input className="input" placeholder="Année" value={item.year} onChange={(e) => setItem({ ...item, year: e.target.value })} />
          <input className="input" placeholder="Secteur" value={item.sector} onChange={(e) => setItem({ ...item, sector: e.target.value })} />
          <input className="input" placeholder="Format (TV 30 s…)" value={item.format} onChange={(e) => setItem({ ...item, format: e.target.value })} />
          <select className="input" value={item.office} onChange={(e) => setItem({ ...item, office: e.target.value })}>
            {OFFICES.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select className="input" value={item.confidentiality} onChange={(e) => setItem({ ...item, confidentiality: e.target.value as Confidentiality })}>
            {Object.entries(CONF).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input className="input" placeholder="Lien (vidéo, drive…)" value={item.url} onChange={(e) => setItem({ ...item, url: e.target.value })} />
          <textarea className="input md:col-span-4" placeholder="Description : idée, insight, script, résultats… *" value={item.summary} onChange={(e) => setItem({ ...item, summary: e.target.value })} />
        </div>
        <button className="btn-ghost self-start" onClick={addItem}>Ajouter à la bibliothèque</button>
        <ul className="divide-y divide-line text-sm">
          {lib.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 py-2">
              <Link href={`/campagne/${c.id}`} className="font-semibold hover:text-accent">{c.title}</Link>
              <span className="text-muted">— {c.brand} · {c.office} · {c.year ?? ""} · {CONF[c.confidentiality ?? "bureau"]}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
