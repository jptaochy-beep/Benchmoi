"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Campaign, Project } from "@/lib/types";

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.json !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({ error: `Erreur HTTP ${res.status}` }));
  if (!res.ok) throw new Error(data.error ?? `Erreur HTTP ${res.status}`);
  return data as T;
}

export function VerificationBadge({ c }: { c: Campaign }) {
  const v = c.verification;
  if (v.status === "internal")
    return <span className="rounded bg-ink/10 px-2 py-0.5 text-xs font-semibold">Interne McCann</span>;
  if (v.status === "verified")
    return (
      <span title={v.reasons.join(" ")} className="rounded bg-ok-bg px-2 py-0.5 text-xs font-semibold text-ok">
        ✓ Vérifiée · confiance {v.confidence}
      </span>
    );
  return (
    <span title={v.reasons.join(" ")} className="rounded bg-warn-bg px-2 py-0.5 text-xs font-semibold text-warn">
      Non confirmée — ne pas citer
    </span>
  );
}

const RECO: Record<Campaign["recognitionType"], string> = {
  award: "Primée",
  popular: "Populaire",
  effectiveness: "Efficacité prouvée",
  none: "Reconnaissance non documentée",
};

export function RecognitionBadge({ c }: { c: Campaign }) {
  return (
    <span className="rounded border border-line px-2 py-0.5 text-xs text-muted" title={c.recognitionDetail ?? ""}>
      {RECO[c.recognitionType]}
    </span>
  );
}

export function CampaignCard({
  c,
  relevance,
  selected,
  onToggle,
}: {
  c: Campaign;
  relevance?: string;
  selected?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className={`card flex flex-col gap-2 ${selected ? "ring-2 ring-accent" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <VerificationBadge c={c} />
        <RecognitionBadge c={c} />
      </div>
      <Link href={`/campagne/${c.id}`} className="text-base font-bold leading-tight hover:text-accent">
        {c.title}
      </Link>
      <div className="text-sm text-muted">
        {c.brand}
        {c.agency ? ` · ${c.agency}` : ""} · {c.country}
        {c.year ? ` · ${c.year}` : ""} · {c.format}
      </div>
      <p className="text-sm">{c.summary}</p>
      {relevance && <p className="text-sm italic text-muted">→ {relevance}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        {c.sourceUrl && (
          <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-accent underline">
            Source
          </a>
        )}
        {c.mediaUrl && c.mediaUrl !== c.sourceUrl && (
          <a href={c.mediaUrl} target="_blank" rel="noreferrer" className="text-xs text-accent underline">
            Vidéo
          </a>
        )}
        <Link href={`/campagne/${c.id}`} className="text-xs underline">
          Fiche d’analyse
        </Link>
        {onToggle && (
          <label className="ml-auto flex cursor-pointer items-center gap-1 text-xs">
            <input type="checkbox" checked={!!selected} onChange={onToggle} /> Sélectionner
          </label>
        )}
      </div>
    </div>
  );
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const reload = () => api<{ projects: Project[] }>("/api/projects").then((d) => setProjects(d.projects)).catch(() => {});
  useEffect(() => {
    reload();
  }, []);
  return { projects, reload };
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="card flex items-center gap-3 text-sm text-muted">
      <span className="h-3 w-3 animate-ping rounded-full bg-accent" />
      {label}
    </div>
  );
}

export function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return <div className="rounded-md border border-accent bg-surface p-3 text-sm text-accent">{error}</div>;
}

export function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((t) => (
        <span key={t} className="rounded-full bg-bg px-2 py-0.5 text-xs text-muted">
          {t}
        </span>
      ))}
    </div>
  );
}
