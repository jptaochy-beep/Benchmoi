import type {
  AnalysisExtraction,
  ComparisonExtraction,
  ScriptExtraction,
  TerritoriesExtraction,
} from "./schemas";

export type VerificationStatus = "verified" | "unconfirmed" | "internal";

export interface Verification {
  status: VerificationStatus;
  inSearchResults: boolean;
  httpStatus: number | null;
  pageMentionsCampaign: boolean | null;
  confidence: "élevée" | "moyenne" | "faible";
  reasons: string[];
  checkedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  agency: string | null;
  country: string;
  year: string | null;
  sector: string;
  format: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  mediaUrl: string | null;
  summary: string;
  recognitionType: "award" | "popular" | "effectiveness" | "none";
  recognitionDetail: string | null;
  recognitionSourceUrl: string | null;
  tags: { insight: string[]; emotion: string[]; mechanic: string[]; narrative_form: string[] };
  sourceType: "web" | "internal";
  office?: string;
  confidentiality?: Confidentiality;
  verification: Verification;
  createdAt: string;
}

export interface SearchFilters {
  region: string;
  format: string;
  sector: string;
  approach: string;
  emotion: string;
  insight: string;
  mechanic: string;
  outOfCategory: boolean;
  africaFocus: boolean;
}

export interface SearchRecord {
  id: string;
  query: string;
  filters: SearchFilters;
  interpretation: string;
  expandedConcepts: string[];
  results: { campaignId: string; relevance: string }[];
  internalMatches: { campaignId: string; relevance: string }[];
  synthesis: { recurring_levers: string[]; underexploited: string[] };
  notFoundNote: string | null;
  collectedUrlCount: number;
  rejectedCount: number;
  durationMs: number;
  createdAt: string;
}

export interface Analysis extends AnalysisExtraction {
  campaignId: string;
  createdAt: string;
  model: string;
}

export type Confidentiality = "reseau" | "bureau" | "equipe" | "confidentiel";

export interface Brief {
  brand: string;
  sector: string;
  target: string;
  problem: string;
  promise: string;
  proof: string;
  tone: string;
  budget: string;
  market: string;
  media: string;
  mandatories: string;
  forbidden: string;
}

export type Territory = TerritoriesExtraction["territories"][number] & { id: string };

export interface ScriptVersion {
  n: number;
  instruction: string;
  content: ScriptExtraction;
  createdAt: string;
}

export interface Script {
  id: string;
  territoryId: string;
  format: string;
  versions: ScriptVersion[];
}

export interface Comparison extends ComparisonExtraction {
  id: string;
  campaignIds: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  office: "Abidjan" | "Douala" | "Dakar" | "Réseau";
  confidentiality: Confidentiality;
  campaignIds: string[];
  searchIds: string[];
  brief: Brief | null;
  territories: Territory[];
  scripts: Script[];
  comparisons: Comparison[];
  createdAt: string;
  updatedAt: string;
}

export interface DB {
  campaigns: Record<string, Campaign>;
  analyses: Record<string, Analysis>;
  searches: Record<string, SearchRecord>;
  projects: Record<string, Project>;
}
