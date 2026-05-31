import type { DomainBrief, ExampleBrief, SearchGoal } from "@/lib/types/domain-brief";
import { DEFAULT_BRIEF } from "@/lib/types/domain-brief";

export const BRAND_TONES = [
  "Premium", "Friendly", "Technical", "Local", "Luxury", "Simple",
  "Modern", "Corporate", "Playful", "Trustworthy", "Category-defining",
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
  ".com preferred", "under $5k", "under $500", "no hyphens",
  "easy to say", "buy now only", "local SEO", "exact match", "brandable",
];

export const SEARCH_GOALS: { value: SearchGoal; label: string; description: string }[] = [
  { value: "start_business", label: "Start a business", description: "Rank names for a new venture" },
  { value: "upgrade_domain", label: "Upgrade my domain", description: "Find stronger alternatives to current domain" },
  { value: "local_service", label: "Local service brand", description: "Trust, recall, and local SEO" },
  { value: "saas_startup", label: "SaaS startup", description: "Brandability and investor perception" },
  { value: "domain_investing", label: "Domain investing", description: "Resale and liquidity signals" },
  { value: "seo_content", label: "SEO content site", description: "Keyword and topical authority" },
];

export const GOAL_VISIBLE_FIELDS: Record<SearchGoal, string[]> = {
  start_business: ["industry", "audience", "productService", "brandTones", "marketingChannels"],
  upgrade_domain: ["currentDomain", "industry", "competitors", "trustRequirements", "maxPrice"],
  local_service: ["productService", "location", "audience", "seoGoals", "trustRequirements"],
  saas_startup: ["industry", "audience", "brandTones", "aiGoals", "marketingChannels"],
  domain_investing: ["industry", "resaleImportance", "maxPrice", "tldPreference"],
  seo_content: ["industry", "seoGoals", "aiGoals", "productService"],
};

export const EXAMPLE_BRIEFS: ExampleBrief[] = [
  {
    id: "saas",
    title: "SaaS startup",
    description: "Eco home technology SaaS for homeowners",
    brief: {
      naming: "Eco home technology SaaS for homeowners",
      searchMode: "business_idea",
      searchGoal: "saas_startup",
      industry: "Smart home / energy",
      audience: "Homeowners",
      productService: "SaaS platform",
      brandTones: ["Modern", "Trustworthy"],
      aiGoals: ["Clear entity meaning", "Low ambiguity"],
      marketingChannels: ["App/SaaS launch", "Investor presentation"],
      priorityWeights: { brand: 2, seo: 1, ai: 1.5, trust: 1, value: 0.5, resale: 0.5 },
    },
  },
  {
    id: "local",
    title: "Local service business",
    description: "Premium landscaping in Florida",
    brief: {
      naming: "Premium landscaping company in Florida",
      searchMode: "keyword",
      searchGoal: "local_service",
      productService: "Landscaping",
      location: "Florida",
      audience: "Homeowners",
      seoGoals: ["Local service relevance"],
      trustRequirements: ["Must be .com", "Easy to say over the phone"],
      requirements: [".com preferred", "local SEO", "easy to say"],
      priorityWeights: { brand: 1, seo: 2, ai: 0.5, trust: 2, value: 1, resale: 0.5 },
    },
  },
  {
    id: "upgrade",
    title: "Upgrade from .io to .com",
    description: "Compare against greenhome.io",
    brief: {
      naming: "Better domain than greenhome.io",
      searchMode: "current_domain",
      searchGoal: "upgrade_domain",
      currentDomain: "greenhome.io",
      industry: "Eco home",
      requirements: [".com preferred", "brandable"],
      priorityWeights: { brand: 2, seo: 1, ai: 1, trust: 2, value: 1, resale: 1 },
    },
  },
  {
    id: "seo-vs-brand",
    title: "Compare SEO vs brand names",
    description: "Eco home tech category",
    brief: {
      naming: "eco home tech",
      searchMode: "business_idea",
      searchGoal: "start_business",
      seoGoals: ["Category keyword included", "Short memorable brand over keyword"],
      priorityWeights: { brand: 1.5, seo: 1.5, ai: 1, trust: 1, value: 1, resale: 0.5 },
    },
  },
  {
    id: "ai-visible",
    title: "Find AI-visible domains",
    description: "AI tool for real estate agents",
    brief: {
      naming: "AI tool for real estate agents",
      searchMode: "business_idea",
      searchGoal: "saas_startup",
      aiGoals: ["Clear entity meaning", "Works well in conversational search", "Low ambiguity"],
      priorityWeights: { brand: 1, seo: 1, ai: 3, trust: 1, value: 1, resale: 0.5 },
    },
  },
  {
    id: "investor",
    title: "Research resale opportunities",
    description: "Cybersecurity startup domains",
    brief: {
      naming: "cybersecurity startup domains",
      searchMode: "investor_research",
      searchGoal: "domain_investing",
      industry: "Cybersecurity",
      resaleImportance: true,
      requirements: ["under $5k"],
      priorityWeights: { brand: 0.5, seo: 0.5, ai: 0.5, trust: 1, value: 2, resale: 3 },
    },
  },
];

export function mergeBrief(partial: Partial<DomainBrief>): DomainBrief {
  return {
    ...DEFAULT_BRIEF,
    ...partial,
    brandTones: partial.brandTones ?? DEFAULT_BRIEF.brandTones,
    marketingChannels: partial.marketingChannels ?? DEFAULT_BRIEF.marketingChannels,
    seoGoals: partial.seoGoals ?? DEFAULT_BRIEF.seoGoals,
    aiGoals: partial.aiGoals ?? DEFAULT_BRIEF.aiGoals,
    trustRequirements: partial.trustRequirements ?? DEFAULT_BRIEF.trustRequirements,
    requirements: partial.requirements ?? DEFAULT_BRIEF.requirements,
    priorityWeights: partial.priorityWeights ?? DEFAULT_BRIEF.priorityWeights,
  };
}

export const WEIGHT_LABELS: { key: keyof DomainBrief["priorityWeights"]; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "seo", label: "SEO" },
  { key: "ai", label: "AI visibility" },
  { key: "trust", label: "Trust" },
  { key: "value", label: "Value" },
  { key: "resale", label: "Resale" },
];
