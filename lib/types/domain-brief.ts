import type { SearchMode } from "@/lib/search/search-config";
import type { DomainCandidate, SignalWeights } from "@/lib/types/domain";

export type SearchUIMode = "quick" | "strategy";

export type SearchGoal =
  | "start_business"
  | "upgrade_domain"
  | "local_service"
  | "saas_startup"
  | "domain_investing"
  | "seo_content";

export type DomainBrief = {
  naming: string;
  searchMode: SearchMode;
  searchGoal: SearchGoal | null;
  industry: string;
  audience: string;
  location: string;
  productService: string;
  currentDomain: string;
  competitors: string;
  brandTones: string[];
  marketingChannels: string[];
  seoGoals: string[];
  aiGoals: string[];
  trustRequirements: string[];
  requirements: string[];
  maxPrice: number;
  tldPreference: string;
  buyNowOnly: boolean;
  premiumAllowed: boolean;
  resaleImportance: boolean;
  priorityWeights: SignalWeights;
};

export const DEFAULT_BRIEF: DomainBrief = {
  naming: "",
  searchMode: "business_idea",
  searchGoal: null,
  industry: "",
  audience: "",
  location: "",
  productService: "",
  currentDomain: "",
  competitors: "",
  brandTones: [],
  marketingChannels: [],
  seoGoals: [],
  aiGoals: [],
  trustRequirements: [],
  requirements: [],
  maxPrice: 5000,
  tldPreference: "any",
  buyNowOnly: false,
  premiumAllowed: true,
  resaleImportance: false,
  priorityWeights: { brand: 1, seo: 1, ai: 1, trust: 1, value: 1, resale: 1 },
};

export type ExampleBrief = {
  id: string;
  title: string;
  description: string;
  brief: Partial<DomainBrief>;
};

export type PinRecommendation = {
  domain: DomainCandidate;
  score: number;
  whyPinned: string;
  wins: string[];
  tradeoff: string;
  recommendedIf: string;
  alternatives: Array<{ domain: string; reason: string; price: number }>;
};

export type BenchmarkDelta = {
  domain: string;
  price: number;
  brand: number;
  seo: number;
  ai: number;
  trust: number;
  value: number;
  priceDiff: number;
  summary: string;
};
