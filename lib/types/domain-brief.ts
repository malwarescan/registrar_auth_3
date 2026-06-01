import type { SearchMode } from "@/lib/search/search-config";
import type { DomainCandidate, SignalWeights } from "@/lib/types/domain";

export type SearchUIMode = "quick" | "strategy";

/** Why the user is buying a domain — controls generation, fields, and scoring. */
export type BuyingIntent =
  | "business_brand"
  | "personal_brand"
  | "local_service"
  | "saas_app"
  | "seo_content"
  | "domain_investment"
  | "brand_protection"
  | "premium_upgrade"
  | "campaign_landing"
  | "ecommerce_store";

/** @deprecated use BuyingIntent */
export type SearchGoal = BuyingIntent;

export type DomainBrief = {
  /** Primary business / project description */
  naming: string;
  /** Required: why they are buying */
  buyingIntent: BuyingIntent | null;
  searchMode: SearchMode;
  /** @deprecated use buyingIntent */
  searchGoal: BuyingIntent | null;
  industry: string;
  audience: string;
  location: string;
  productService: string;
  currentDomain: string;
  competitors: string;
  /** Personal brand: person's name */
  personalName: string;
  profession: string;
  marketScope: string;
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
  buyingIntent: null,
  searchMode: "business_idea",
  searchGoal: null,
  industry: "",
  audience: "",
  location: "",
  productService: "",
  currentDomain: "",
  competitors: "",
  personalName: "",
  profession: "",
  marketScope: "",
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

/** Normalize brief so buyingIntent and legacy searchGoal stay in sync. */
export function resolveBuyingIntent(brief: DomainBrief): BuyingIntent | null {
  return brief.buyingIntent ?? brief.searchGoal;
}
