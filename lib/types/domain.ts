import type { GenerationPass, NamingLane } from "@/lib/types/naming";

export type SignalScores = {
  brand: number;
  marketing: number;
  search: number;
  ai: number;
  trust: number;
  resale: number;
};

export type DomainAnalysis = {
  strengths: string[];
  watchOuts: string[];
  idealFor: string[];
  notIdealFor: string[];
  recommendedAction: string;
  signalEvidence?: SignalEvidence;
};

export type SignalEvidence = {
  brand: string;
  marketing: string;
  seo: string;
  ai: string;
  trust: string;
  value: string;
  resale: string;
  risk: string;
};

export type AvailabilityStatus =
  | "available"
  | "premium_available"
  | "marketplace_available"
  | "taken"
  | "benchmark_only"
  | "idea_only"
  | "unknown"
  | "api_error";


export type DomainCandidate = {
  domain: string;
  price: number;
  priceType: "registration" | "marketplace";
  available: boolean;
  availabilityStatus: AvailabilityStatus;
  signals: SignalScores;
  analysis: DomainAnalysis;
  badges: string[];
  valueScore?: number;
  riskScore?: number;
  ambiguityRisk?: number;
  namingLane?: NamingLane;
  generationPass?: GenerationPass;
  seedDomain?: string;
};

/** Buyable-only decision stack (extended slots optional until Phase 4). */
export type DecisionStack = {
  overall?: DomainCandidate;
  brand: DomainCandidate;
  seo: DomainCandidate;
  ai: DomainCandidate;
  value?: DomainCandidate;
  risk?: DomainCandidate;
  resale?: DomainCandidate;
};

export type OptimizeMode =
  | "overall"
  | "brand"
  | "seo"
  | "ai"
  | "value"
  | "resale"
  | "trust"
  | "marketing";

export type SignalWeights = {
  brand: number;
  seo: number;
  ai: number;
  value: number;
  trust: number;
  resale: number;
};

export type DomainRankings = {
  brand: number;
  seo: number;
  ai: number;
  trust: number;
  value: number;
  resale: number;
  risk: number;
  marketing: number;
  overall: number;
};

export type SignalWinner = {
  id: string;
  label: string;
  domain: string;
  price: number;
  score: number;
  reason: string;
};

export type DashboardView = {
  candidates: DomainCandidate[];
  rankings: Record<string, DomainRankings>;
  winners: SignalWinner[];
  rankedResults: DomainCandidate[];
  graphPoints: {
    brandVsSeo: GraphPoint[];
    priceVsTrust: GraphPoint[];
    aiVsAmbiguity: GraphPoint[];
  };
};

export type GraphPoint = {
  domain: string;
  x: number;
  y: number;
  price: number;
};

export type AnalyzeFilters = {
  maxPrice?: number;
  tld?: string;
};

export type AnalyzeRequest = {
  query?: string;
  brief?: import("@/lib/types/domain-brief").DomainBrief;
  filters?: AnalyzeFilters;
  weights?: SignalWeights;
};

export type AnalyzeDataSource = "marketplace" | "registration";

export type AnalyzeResponse = {
  query: string;
  results: DomainCandidate[];
  decisionStack: DecisionStack | null;
  dataSource: AnalyzeDataSource;
  dataSourceNote?: string;
  generationMeta?: import("@/lib/intelligence/regeneration").GenerationMeta;
};

export type CompareResponse = {
  domains: DomainCandidate[];
  rankings: Record<string, { brand: number; seo: number; ai: number }>;
  tradeoffPoints: Array<{
    domain: string;
    brandStrength: number;
    searchRelevance: number;
  }>;
  decisions: Array<{
    id: string;
    title: string;
    description: string;
    domain: string;
    icon: "brand" | "search" | "balance";
  }>;
  summary: string;
};

export type SearchFilters = {
  maxPrice: number;
  tld: string;
  activeFilterCount: number;
};

export const DEFAULT_SIGNAL_WEIGHTS: SignalWeights = {
  brand: 1,
  seo: 1,
  ai: 1,
  value: 1,
  trust: 1,
  resale: 1,
};

export const OPTIMIZE_PRESETS: Record<OptimizeMode, SignalWeights> = {
  overall: { brand: 1, seo: 1, ai: 1, value: 1, trust: 1, resale: 1 },
  brand: { brand: 3, seo: 0.5, ai: 0.5, value: 0.5, trust: 1, resale: 1.5 },
  seo: { brand: 0.5, seo: 3, ai: 1, value: 0.5, trust: 0.5, resale: 0.5 },
  ai: { brand: 0.5, seo: 1, ai: 3, value: 0.5, trust: 0.5, resale: 0.5 },
  value: { brand: 0.5, seo: 1, ai: 0.5, value: 3, trust: 1, resale: 0.5 },
  resale: { brand: 1, seo: 0.5, ai: 0.5, value: 0.5, trust: 1, resale: 3 },
  trust: { brand: 1, seo: 0.5, ai: 0.5, value: 0.5, trust: 3, resale: 1 },
  marketing: { brand: 1.5, seo: 1, ai: 1, value: 0.5, trust: 1, resale: 0.5 },
};

export type RankingDimension =
  | "brand"
  | "seo"
  | "ai"
  | "trust"
  | "value"
  | "resale"
  | "risk"
  | "marketing"
  | "overall";
