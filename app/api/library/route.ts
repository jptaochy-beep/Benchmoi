import { NextResponse } from "next/server";
import { mutateDB, newId, now, readDB } from "@/lib/store";
import type { Campaign, Confidentiality } from "@/lib/types";

export const runtime = "nodejs";

/** Bibliothèque interne McCann : campagnes, scripts, références déposés par les bureaux. */
export async function GET() {
  const db = await readDB();
  const items = Object.values(db.campaigns)
    .filter((c) => c.sourceType === "internal")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const b = (await req.json()) as {
    title: string;
    brand: string;
    year?: string;
    sector?: string;
    format?: string;
    office?: string;
    confidentiality?: Confidentiality;
    url?: string;
    summary: string;
  };
  if (!b.title?.trim() || !b.brand?.trim() || !b.summary?.trim())
    return NextResponse.json({ error: "Titre, marque et description sont requis." }, { status: 400 });
  const c: Campaign = {
    id: newId("int"),
    title: b.title.trim(),
    brand: b.brand.trim(),
    agency: `McCann ${b.office ?? ""}`.trim(),
    country: { Abidjan: "Côte d'Ivoire", Douala: "Cameroun", Dakar: "Sénégal" }[b.office ?? ""] ?? "Afrique",
    year: b.year?.trim() || null,
    sector: b.sector?.trim() || "",
    format: b.format?.trim() || "",
    sourceUrl: b.url?.trim() || null,
    sourceTitle: null,
    mediaUrl: b.url?.trim() || null,
    summary: b.summary.trim(),
    recognitionType: "none",
    recognitionDetail: null,
    recognitionSourceUrl: null,
    tags: { insight: [], emotion: [], mechanic: [], narrative_form: [] },
    sourceType: "internal",
    office: b.office,
    confidentiality: b.confidentiality ?? "bureau",
    verification: {
      status: "internal",
      inSearchResults: false,
      httpStatus: null,
      pageMentionsCampaign: null,
      confidence: "élevée",
      reasons: ["Campagne déposée par une équipe McCann."],
      checkedAt: now(),
    },
    createdAt: now(),
  };
  await mutateDB((d) => {
    d.campaigns[c.id] = c;
  });
  return NextResponse.json({ item: c });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id")!;
  await mutateDB((d) => {
    if (d.campaigns[id]?.sourceType === "internal") delete d.campaigns[id];
  });
  return NextResponse.json({ ok: true });
}
