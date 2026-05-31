import type { OptimizeMode } from "@/lib/types/domain";
import type { GraphPoint } from "@/lib/types/domain";

export type SearchMode =
  | "business_idea"
  | "keyword"
  | "current_domain"
  | "industry"
  | "investor_research";

export type SearchModeOption = {
  value: SearchMode;
  label: string;
  description: string;
};

export const SEARCH_MODES: SearchModeOption[] = [
  {
    value: "business_idea",
    label: "Business idea",
    description: "Generate naming options and rank domains",
  },
  {
    value: "keyword",
    label: "Keyword",
    description: "Find exact/partial match domains and alternatives",
  },
  {
    value: "current_domain",
    label: "Current domain",
    description: "Compare upgrade paths and stronger alternatives",
  },
  {
    value: "industry",
    label: "Industry",
    description: "Show category opportunities and domain patterns",
  },
  {
    value: "investor_research",
    label: "Investor research",
    description: "Resale, liquidity, and opportunity signals",
  },
];

export const OPTIMIZE_CHIPS: { value: OptimizeMode; label: string }[] = [
  { value: "overall", label: "Best overall" },
  { value: "brand", label: "Brand" },
  { value: "seo", label: "SEO" },
  { value: "ai", label: "AI visibility" },
  { value: "trust", label: "Trust" },
  { value: "value", label: "Value" },
  { value: "resale", label: "Resale" },
];

export const EXAMPLE_SEARCHES = [
  "premium landscaping company in Florida",
  "AI tool for real estate agents",
  "smart home SaaS",
  "better domain than greenhome.io",
  "local roofing company",
  "domain names for cybersecurity startup",
  "eco home tech",
  "AI legal assistant",
  "luxury dog grooming",
  "pasta in los angeles",
];

export type StartingPath = {
  id: string;
  title: string;
  description: string;
  query: string;
  mode: SearchMode;
  optimize: OptimizeMode;
};

export const STARTING_PATHS: StartingPath[] = [
  {
    id: "start-business",
    title: "Start a business",
    description: "Rank available domains by brand, trust, SEO, and value.",
    query: "eco home tech",
    mode: "business_idea",
    optimize: "overall",
  },
  {
    id: "upgrade-domain",
    title: "Upgrade my domain",
    description: "Compare your current domain against stronger .com alternatives.",
    query: "better domain than mybrand.io",
    mode: "current_domain",
    optimize: "brand",
  },
  {
    id: "local-service",
    title: "Local service brand",
    description: "Prioritize trust, clarity, phone recall, and local SEO fit.",
    query: "premium landscaping company in Florida",
    mode: "keyword",
    optimize: "trust",
  },
  {
    id: "saas-startup",
    title: "SaaS startup",
    description: "Prioritize brandability, AI clarity, memorability, and investor perception.",
    query: "smart home SaaS",
    mode: "business_idea",
    optimize: "brand",
  },
  {
    id: "domain-investor",
    title: "Domain investing",
    description: "Prioritize liquidity, resale angle, price-to-value, and buyer universe.",
    query: "cybersecurity startup domains",
    mode: "investor_research",
    optimize: "resale",
  },
];

export const WHAT_YOU_GET = [
  { icon: "map", label: "Signal Map" },
  { icon: "stack", label: "Decision Stack" },
  { icon: "matrix", label: "Ranking Matrix" },
  { icon: "cards", label: "Domain Cards" },
  { icon: "compare", label: "Compare View" },
] as const;

export const OUTPUT_PREVIEW_ITEMS = [
  {
    icon: "map" as const,
    title: "Signal Map",
    description: "Plot domains by brand strength, SEO relevance, AI clarity, trust, and value.",
  },
  {
    icon: "stack" as const,
    title: "Decision Stack",
    description: "Winners for best brand, SEO fit, AI visibility, value, and lowest risk.",
  },
  {
    icon: "matrix" as const,
    title: "Ranking Matrix",
    description: "Compare domains side by side across the signals that matter.",
  },
  {
    icon: "pin" as const,
    title: "Pinned Best Domain",
    description: "Strongest recommended domain with wins, tradeoffs, and alternatives.",
  },
  {
    icon: "compare" as const,
    title: "Compare View",
    description: "Review top options before buying.",
  },
];

export const SAMPLE_DECISION_STACK = [
  { label: "Best Brand", domain: "BrightNest.com" },
  { label: "Best SEO", domain: "EcoHomeTech.com" },
  { label: "Best AI Visibility", domain: "SmartEcoHome.com" },
  { label: "Best Value", domain: "EcoHome.tech" },
];

export const PREVIEW_CARDS = [
  {
    title: "Signal Map",
    description:
      "See domains plotted by brand strength, SEO relevance, AI clarity, trust, and value.",
  },
  {
    title: "Domain Decision Stack",
    description:
      "Get winners for best brand, best SEO fit, best AI visibility, best value, and lowest risk.",
  },
  {
    title: "Comparison Matrix",
    description: "Compare domains side by side across the signals that actually matter.",
  },
];

export const SAMPLE_GRAPH_POINTS: GraphPoint[] = [
  { domain: "BrightNest.com", x: 88, y: 72, price: 12.99 },
  { domain: "EcoHome.tech", x: 76, y: 85, price: 2499 },
  { domain: "EcoHomeTech.com", x: 82, y: 94, price: 4500 },
  { domain: "GreenNest.io", x: 91, y: 68, price: 890 },
];

export const MODE_PLACEHOLDERS: Record<SearchMode, string> = {
  business_idea: 'Try "eco home tech", "AI real estate tool", or "luxury dog grooming"',
  keyword: 'Try "premium landscaping Florida" or "hot chicken LA"',
  current_domain: 'Try "better domain than mybrand.io" or "upgrade from greenhome.tech"',
  industry: 'Try "cybersecurity startup" or "local HVAC services"',
  investor_research: 'Try "short .com brandables under $5k" or "SaaS resale domains"',
};

export const MODE_DEFAULT_OPTIMIZE: Record<SearchMode, OptimizeMode> = {
  business_idea: "overall",
  keyword: "seo",
  current_domain: "brand",
  industry: "overall",
  investor_research: "resale",
};

export function getSuggestions(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const fromExamples = EXAMPLE_SEARCHES.filter((ex) => ex.toLowerCase().includes(q));
  const extras: string[] = [];
  if (q.includes("eco") || q.includes("home")) {
    extras.push(
      "Eco home technology SaaS",
      "Smart home energy platform",
      "Green home automation",
      "Eco home .com alternatives",
      "Compare eco-home brand vs SEO names"
    );
  }
  if (q.includes("ai")) {
    extras.push("AI real estate tool", "AI legal assistant", "AI customer support SaaS");
  }
  if (q.includes("domain") || q.includes(".io")) {
    extras.push("better domain than mybrand.io", "eco home .com alternatives");
  }

  return [...new Set([...fromExamples, ...extras])].slice(0, 6);
}

export const NO_MATCH_SUGGESTIONS = [
  { label: "Stronger .com alternatives", optimize: "brand" as OptimizeMode },
  { label: "More brandable names", optimize: "brand" as OptimizeMode },
  { label: "Cheaper options", optimize: "value" as OptimizeMode },
  { label: "SEO-focused names", optimize: "seo" as OptimizeMode },
  { label: "AI-clear names", optimize: "ai" as OptimizeMode },
  { label: "Broader category names", optimize: "overall" as OptimizeMode },
];
