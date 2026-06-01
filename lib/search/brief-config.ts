import type { BuyingIntent, DomainBrief } from "@/lib/types/domain-brief";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import type { SignalWeights } from "@/lib/types/domain";
import { DEFAULT_BRIEF } from "@/lib/types/domain-brief";

export const BRAND_TONES = [
  "Trustworthy", "Modern", "Premium", "Simple", "Protective", "Friendly",
  "Technical", "Local", "Luxury", "Corporate", "Playful", "Category-defining",
];

export const MARKETING_CHANNELS = [
  "Paid ads", "Organic SEO", "Local SEO", "Word of mouth", "Social media",
  "B2B sales", "Ecommerce", "App/SaaS launch", "Investor presentation", "Resale/flipping",
];

export const SEO_GOALS = [
  "Exact-match relevance", "Topical authority", "Local service relevance",
  "Content cluster potential", "Short memorable brand over keyword",
  "Category keyword included", "Avoid keyword stuffing",
];

export const AI_GOALS = [
  "Clear entity meaning", "Easy category association", "Low ambiguity",
  "Strong semantic relevance", "Works well in conversational search",
  "Supports schema/entity building", "Memorable enough for brand recall",
];

export const TRUST_REQUIREMENTS = [
  "Must be .com", "No hyphens", "No numbers", "Easy to spell",
  "Easy to say over the phone", "Consumer-friendly", "Professional B2B",
  "Medical/legal/finance-grade trust", "Mainstream audience",
];

export const REQUIREMENT_CHIPS = [
  ".com preferred", "under $500", "under $2k", "under $10k", "no hyphens",
  "easy to say", "buy now only", "exact match", "brandable", "local SEO", "AI-visible",
];

export const BUYING_INTENTS: {
  value: BuyingIntent;
  label: string;
  description: string;
}[] = [
  {
    value: "business_brand",
    label: "Business brand",
    description: "Company, startup, product, or ecommerce brand",
  },
  {
    value: "personal_brand",
    label: "Personal brand",
    description: "Founder, creator, consultant, or professional identity",
  },
  {
    value: "local_service",
    label: "Local service business",
    description: "City/region service — trust, recall, local SEO",
  },
  {
    value: "saas_app",
    label: "SaaS / app / tech product",
    description: "Software, AI tools, platforms, dashboards",
  },
  {
    value: "seo_content",
    label: "SEO content site",
    description: "Affiliate, lead-gen, blog, niche authority",
  },
  {
    value: "domain_investment",
    label: "Domain investment / resale",
    description: "Resale potential, liquidity, buyer universe",
  },
  {
    value: "brand_protection",
    label: "Brand protection",
    description: "Defensive registrations, typos, related TLDs",
  },
  {
    value: "premium_upgrade",
    label: "Premium upgrade",
    description: "Stronger .com, shorter name, more trusted upgrade",
  },
  {
    value: "campaign_landing",
    label: "Campaign / landing page",
    description: "Ads, launches, events, short-term promos",
  },
  {
    value: "ecommerce_store",
    label: "Ecommerce store",
    description: "Product store — trust, memorability, checkout confidence",
  },
];

/** @deprecated use BUYING_INTENTS */
export const SEARCH_GOALS = BUYING_INTENTS;

export const INTENT_VISIBLE_FIELDS: Record<BuyingIntent, string[]> = {
  business_brand: ["industry", "audience", "brandTones", "marketScope", "maxPrice", "tldPreference"],
  personal_brand: ["personalName", "profession", "audience", "brandTones", "tldPreference"],
  local_service: ["productService", "location", "audience", "trustRequirements", "maxPrice"],
  saas_app: ["industry", "audience", "brandTones", "aiGoals", "maxPrice", "tldPreference"],
  seo_content: ["industry", "productService", "seoGoals", "aiGoals", "maxPrice"],
  domain_investment: ["industry", "resaleImportance", "maxPrice", "tldPreference"],
  brand_protection: ["currentDomain", "competitors", "trustRequirements", "tldPreference"],
  premium_upgrade: ["currentDomain", "industry", "competitors", "maxPrice", "tldPreference"],
  campaign_landing: ["audience", "productService", "maxPrice", "tldPreference"],
  ecommerce_store: ["industry", "audience", "brandTones", "trustRequirements", "maxPrice"],
};

/** @deprecated use INTENT_VISIBLE_FIELDS */
export const GOAL_VISIBLE_FIELDS = INTENT_VISIBLE_FIELDS;

/** Default priority weights per buying intent */
export const INTENT_WEIGHT_PRESETS: Record<BuyingIntent, SignalWeights> = {
  business_brand: { brand: 2.5, seo: 1, ai: 1.2, trust: 2, value: 1, resale: 0.5 },
  personal_brand: { brand: 2, seo: 1, ai: 1, trust: 2.5, value: 1, resale: 0.3 },
  local_service: { brand: 1.2, seo: 2.5, ai: 0.8, trust: 2.5, value: 1, resale: 0.3 },
  saas_app: { brand: 2.5, seo: 1, ai: 2.5, trust: 1.2, value: 1, resale: 1 },
  seo_content: { brand: 1, seo: 3, ai: 2, trust: 1.2, value: 1, resale: 0.5 },
  domain_investment: { brand: 1.5, seo: 1, ai: 0.8, trust: 1.2, value: 2.5, resale: 3 },
  brand_protection: { brand: 2, seo: 0.8, ai: 0.8, trust: 2.5, value: 1, resale: 0.5 },
  premium_upgrade: { brand: 2.5, seo: 1, ai: 1, trust: 2.5, value: 1.2, resale: 0.8 },
  campaign_landing: { brand: 2, seo: 1, ai: 1.2, trust: 1.5, value: 1.5, resale: 0.3 },
  ecommerce_store: { brand: 2.2, seo: 1.2, ai: 1, trust: 2.5, value: 1, resale: 0.5 },
};

export const EXAMPLE_BRIEFS: import("@/lib/types/domain-brief").ExampleBrief[] = [
  {
    id: "home-security",
    title: "Home security brand",
    description: "Trustworthy home security company",
    brief: {
      naming: "Home security system company",
      buyingIntent: "business_brand",
      searchGoal: "business_brand",
      industry: "Home security",
      audience: "Homeowners, families",
      brandTones: ["Trustworthy", "Modern", "Protective"],
      marketScope: "National",
      requirements: [".com preferred", "brandable"],
      tldPreference: "com",
      priorityWeights: INTENT_WEIGHT_PRESETS.business_brand,
    },
  },
  {
    id: "saas",
    title: "SaaS startup",
    description: "Eco home technology SaaS for homeowners",
    brief: {
      naming: "Eco home technology SaaS for homeowners",
      buyingIntent: "saas_app",
      searchGoal: "saas_app",
      industry: "Smart home / energy",
      audience: "Homeowners",
      brandTones: ["Modern", "Trustworthy"],
      aiGoals: ["Clear entity meaning", "Low ambiguity"],
      priorityWeights: INTENT_WEIGHT_PRESETS.saas_app,
    },
  },
  {
    id: "local",
    title: "Local service business",
    description: "Premium landscaping in Florida",
    brief: {
      naming: "Premium landscaping company",
      buyingIntent: "local_service",
      searchGoal: "local_service",
      productService: "Landscaping",
      location: "Florida",
      audience: "Homeowners",
      requirements: [".com preferred", "local SEO", "easy to say"],
      priorityWeights: INTENT_WEIGHT_PRESETS.local_service,
    },
  },
  {
    id: "seo",
    title: "SEO content site",
    description: "Home security reviews and guides",
    brief: {
      naming: "Home security reviews and buying guides",
      buyingIntent: "seo_content",
      searchGoal: "seo_content",
      industry: "Home security",
      seoGoals: ["Exact-match relevance", "Topical authority"],
      requirements: ["exact match"],
      priorityWeights: INTENT_WEIGHT_PRESETS.seo_content,
    },
  },
  {
    id: "upgrade",
    title: "Premium upgrade",
    description: "Upgrade from greenhome.io to stronger .com",
    brief: {
      naming: "Stronger .com for eco home brand",
      buyingIntent: "premium_upgrade",
      searchGoal: "premium_upgrade",
      currentDomain: "greenhome.io",
      industry: "Eco home",
      requirements: [".com preferred", "brandable"],
      priorityWeights: INTENT_WEIGHT_PRESETS.premium_upgrade,
    },
  },
];

export function mergeBrief(partial: Partial<DomainBrief>): DomainBrief {
  const intent = partial.buyingIntent ?? partial.searchGoal ?? null;
  return {
    ...DEFAULT_BRIEF,
    ...partial,
    buyingIntent: intent,
    searchGoal: intent,
    brandTones: partial.brandTones ?? DEFAULT_BRIEF.brandTones,
    marketingChannels: partial.marketingChannels ?? DEFAULT_BRIEF.marketingChannels,
    seoGoals: partial.seoGoals ?? DEFAULT_BRIEF.seoGoals,
    aiGoals: partial.aiGoals ?? DEFAULT_BRIEF.aiGoals,
    trustRequirements: partial.trustRequirements ?? DEFAULT_BRIEF.trustRequirements,
    requirements: partial.requirements ?? DEFAULT_BRIEF.requirements,
    priorityWeights:
      partial.priorityWeights ??
      (intent ? INTENT_WEIGHT_PRESETS[intent] : DEFAULT_BRIEF.priorityWeights),
  };
}

export function applyIntentToBrief(brief: DomainBrief, intent: BuyingIntent): DomainBrief {
  return mergeBrief({
    ...brief,
    buyingIntent: intent,
    searchGoal: intent,
    priorityWeights: INTENT_WEIGHT_PRESETS[intent],
  });
}

export function getIntentWeights(brief: DomainBrief): SignalWeights {
  const intent = resolveBuyingIntent(brief);
  if (!intent) return brief.priorityWeights;
  return brief.priorityWeights;
}

export const WEIGHT_LABELS: { key: keyof DomainBrief["priorityWeights"]; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "seo", label: "SEO" },
  { key: "ai", label: "AI visibility" },
  { key: "trust", label: "Trust" },
  { key: "value", label: "Value" },
  { key: "resale", label: "Resale" },
];

export const MARKET_SCOPES = ["Local", "Regional", "National", "Global"];

export const BUDGET_OPTIONS = [
  { value: 500, label: "Under $500" },
  { value: 2000, label: "Under $2,000" },
  { value: 5000, label: "Under $5k" },
  { value: 10000, label: "Under $10k" },
];

export const TLD_OPTIONS = [
  { value: "any", label: "Any TLD" },
  { value: "com", label: ".com preferred" },
  { value: "net", label: ".net" },
  { value: "io", label: ".io" },
  { value: "ai", label: ".ai" },
  { value: "co", label: ".co" },
];
