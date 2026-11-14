import { NextResponse } from "next/server";
import { mutateDB, newId, now, readDB } from "@/lib/store";
import type { Brief, Project } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const db = await readDB();
  if (id) {
    const p = db.projects[id];
    if (!p) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    const ids = new Set(p.campaignIds);
    p.searchIds.forEach((sid) => db.searches[sid]?.results.forEach((r) => ids.add(r.campaignId)));
    const campaigns = [...ids].map((cid) => db.campaigns[cid]).filter(Boolean);
    const searches = p.searchIds.map((sid) => db.searches[sid]).filter(Boolean);
    return NextResponse.json({ project: p, campaigns, searches });
  }
  const projects = Object.values(db.projects).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const b = (await req.json()) as Partial<Project>;
  if (!b.name?.trim()) return NextResponse.json({ error: "Nom du projet requis." }, { status: 400 });
  const p: Project = {
    id: newId("prj"),
    name: b.name.trim(),
    client: b.client?.trim() ?? "",
    office: b.office ?? "Abidjan",
    confidentiality: b.confidentiality ?? "equipe",
    campaignIds: [],
    searchIds: [],
    brief: null,
    territories: [],
    scripts: [],
    comparisons: [],
    createdAt: now(),
    updatedAt: now(),
  };
  await mutateDB((d) => {
    d.projects[p.id] = p;
  });
  return NextResponse.json({ project: p });
}

/** Mises à jour partielles : brief, ajout/retrait de campagnes. */
export async function PATCH(req: Request) {
  const b = (await req.json()) as {
    id: string;
    brief?: Brief;
    addCampaignIds?: string[];
    removeCampaignId?: string;
  };
  const project = await mutateDB((d) => {
    const p = d.projects[b.id];
    if (!p) return null;
    if (b.brief) p.brief = b.brief;
    if (b.addCampaignIds) p.campaignIds = [...new Set([...p.campaignIds, ...b.addCampaignIds.filter((id) => d.campaigns[id])])];
    if (b.removeCampaignId) p.campaignIds = p.campaignIds.filter((id) => id !== b.removeCampaignId);
    p.updatedAt = now();
    return p;
  });
  if (!project) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
  return NextResponse.json({ project });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id")!;
  await mutateDB((d) => {
    delete d.projects[id];
  });
  return NextResponse.json({ ok: true });
}
