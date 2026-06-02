import type { BuyingIntent, DomainBrief } from "@/lib/types/domain-brief";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import { analyzeQueryContext } from "@/lib/intelligence/query-context";
import {
  resolveQueryLiteralness,
  type LiteralnessPolicy,
} from "@/lib/intelligence/query-literalness";

const STOP = new Set([
  "a", "an", "the", "for", "and", "or", "of", "to", "in", "at", "on", "with", "by",
  "my", "our", "your", "company", "business", "brand", "store", "shop", "service",
  "services", "system", "systems", "platform", "app", "tool", "tools", "website",
  "local", "near", "premium", "best", "top", "buyer", "buyers",
]);

const US_STATE_ABBREVS = new Set([
  "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "id", "il", "in", "ia",
  "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
  "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt",
  "va", "wa", "wv", "wi", "wy", "dc",
]);

function isStateAbbrev(token: string): boolean {
  return US_STATE_ABBREVS.has(token.toLowerCase());
}

export type NicheCategory =
  | "food"
  | "home_services"
  | "professional"
  | "health"
  | "retail"
  | "tech"
  | "general";

export type NamingConstraints = {
  allowHyphens: boolean;
  allowNumbers: boolean;
  maxLabelLength: number;
  preferCom: boolean;
  preferBrandable: boolean;
  preferExactMatch: boolean;
  /** User explicitly wants keyword-style local slugs (exact match / local SEO chip). */
  preferKeywordSlug: boolean;
  preferLocalSeo: boolean;
};

/** Structured inputs for intent-specialized domain generation. */
export type NamingCriteria = {
  intent: BuyingIntent;
  description: string;
  industry: string;
  audience: string;
  /** Primary service/product — from productService or extracted */
  service: string;
  locationCity: string;
  locationRegion: string;
  personalName: string;
  profession: string;
  currentDomain: string;
  competitors: string;
  marketScope: string;
  serviceKeywords: string[];
  locationKeywords: string[];
  nicheCategory: NicheCategory;
  tones: string[];
  constraints: NamingConstraints;
  tldPreference: string[];
  /** We know what business/product they described (not a vague prompt). */
  hasSubject: boolean;
  /** Description includes a city/region ("in Pasadena", location field, etc.). */
  isLocalContext: boolean;
  /** Query literalness policy for generation and ranking context. */
  literalness: LiteralnessPolicy;
};

export type { LiteralnessPolicy };

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, " ")
    .split(/[\s,_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function parseLocationField(location: string): { city: string; region: string } {
  const trimmed = location.trim();
  if (!trimmed) return { city: "", region: "" };

  const parts = trimmed.split(/[,;/]+|\s+in\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts[0], region: parts[parts.length - 1] };
  }
  const tokens = tokenize(trimmed);
  if (tokens.length >= 2) {
    return { city: tokens[0], region: tokens[tokens.length - 1] };
  }
  return { city: trimmed, region: "" };
}

const FOOD_WORDS = new Set([
  "pizza", "pizzeria", "parlour", "parlor", "cafe", "coffee", "bar", "bakery", "bistro",
  "pasta", "taco", "sushi", "grill", "bbq", "brewery", "restaurant", "kitchen", "eats",
]);
const HOME_WORDS = new Set([
  "landscaping", "lawn", "garden", "plumbing", "roofing", "hvac", "cleaning", "electric",
  "electrician", "mechanic", "towing", "pest", "paint", "remodel",
]);
const PRO_WORDS = new Set([
  "lawyer", "attorney", "legal", "accountant", "consultant", "agency", "realty", "realtor",
  "insurance", "financial", "advisor",
]);
const HEALTH_WORDS = new Set([
  "dentist", "dental", "clinic", "medical", "therapy", "chiro", "chiropractic", "vet",
  "veterinary", "spa", "salon", "gym", "fitness",
]);
const RETAIL_WORDS = new Set(["florist", "boutique", "market", "supply", "goods"]);
const TECH_WORDS = new Set([
  "saas", "software", "app", "platform", "ai", "tech", "cloud", "data", "cyber",
]);

export function detectNicheCategory(tokens: string[], industry: string): NicheCategory {
  const corpus = [...tokens, ...tokenize(industry)].map((t) => t.toLowerCase());
  const has = (set: Set<string>) => corpus.some((t) => set.has(t));
  if (has(FOOD_WORDS)) return "food";
  if (has(HOME_WORDS)) return "home_services";
  if (has(PRO_WORDS)) return "professional";
  if (has(HEALTH_WORDS)) return "health";
  if (has(RETAIL_WORDS)) return "retail";
  if (has(TECH_WORDS)) return "tech";
  return "general";
}

function deriveConstraints(brief: DomainBrief, intent: BuyingIntent): NamingConstraints {
  const reqs = [...brief.requirements, ...brief.trustRequirements];
  const seoGoals = brief.seoGoals;

  return {
    allowHyphens: !reqs.some((r) => r.toLowerCase().includes("no hyphen")),
    allowNumbers: !reqs.some((r) => r.toLowerCase().includes("no number")),
    maxLabelLength: reqs.some((r) => r.includes("easy to say")) ? 14 : 22,
    preferCom: reqs.some((r) => r.includes(".com")) || brief.tldPreference === "com",
    preferBrandable:
      reqs.includes("brandable") ||
      intent === "business_brand" ||
      intent === "saas_app" ||
      intent === "ecommerce_store" ||
      intent === "campaign_landing" ||
      seoGoals.some((g) => g.includes("memorable brand")),
    preferExactMatch:
      reqs.includes("exact match") ||
      seoGoals.some((g) => g.includes("Exact-match") || g.includes("Category keyword")),
    preferKeywordSlug:
      reqs.includes("exact match") ||
      reqs.includes("local SEO") ||
      seoGoals.some((g) => g.includes("Exact-match") || g.includes("Local service relevance")),
    preferLocalSeo:
      reqs.includes("local SEO") ||
      intent === "local_service" ||
      brief.brandTones.includes("Local"),
  };
}

function deriveTlds(brief: DomainBrief, intent: BuyingIntent, constraints: NamingConstraints): string[] {
  const pref = brief.tldPreference.replace(/^\./, "").toLowerCase();
  if (pref && pref !== "any") return [pref];
  if (constraints.preferCom) return ["com", "net", "co"];
  if (intent === "saas_app") return ["com", "io", "ai", "co"];
  if (intent === "domain_investment") {
    const corpus = `${brief.naming} ${brief.industry}`.toLowerCase();
    const techLike = /saas|software|ai|tech|cloud|data|app|platform/.test(corpus);
    return techLike ? ["com", "ai", "io", "co"] : ["com", "net", "co"];
  }
  if (intent === "local_service" || intent === "ecommerce_store") return ["com", "net", "co"];
  if (intent === "seo_content") return ["com", "net", "org"];
  return ["com", "net", "co", "io"];
}

/** Pick the most specific service noun for domain generation. */
function pickPrimaryService(serviceKeywords: string[]): string {
  const priority = [
    "pizza", "pizzeria", "landscaping", "plumbing", "roofing", "dentist", "lawyer",
    "salon", "spa", "cafe", "coffee", "hvac", "electrician", "cleaning", "gym",
  ];
  for (const p of priority) {
    if (serviceKeywords.includes(p)) return p;
  }
  return serviceKeywords.find((t) => t !== "parlour" && t !== "parlor" && t !== "restaurant") ?? serviceKeywords[0] ?? "";
}

/** Build structured naming criteria from the full domain brief. */
export function extractNamingCriteria(brief: DomainBrief): NamingCriteria | null {
  const intent = resolveBuyingIntent(brief);
  if (!intent) return null;

  const description = brief.naming.trim();
  const corpus = [
    description,
    brief.productService,
    brief.industry,
    brief.location,
    brief.profession,
    brief.personalName,
  ]
    .filter(Boolean)
    .join(" ");

  const context = analyzeQueryContext(corpus);
  const parsedLocation = parseLocationField(brief.location);

  let locationCity = parsedLocation.city || (context.isLocalIntent ? context.locationTokens[0] : "") || "";
  let locationRegion = parsedLocation.region || (context.isLocalIntent ? context.locationTokens[1] : "") || "";
  if (!locationCity && context.isLocalIntent && context.locationTokens.length > 0) {
    locationCity = context.locationTokens[0];
    locationRegion = context.locationTokens.slice(1).join(" ");
  }
  if (isStateAbbrev(locationCity) && locationRegion) {
    [locationCity, locationRegion] = [locationRegion, locationCity];
  }
  if (isStateAbbrev(locationRegion)) {
    locationRegion = locationRegion.toUpperCase();
  }

  const serviceFromField = brief.productService.trim();
  let serviceKeywords = serviceFromField
    ? tokenize(serviceFromField)
    : [...context.businessTokens].filter((t) => !isStateAbbrev(t));

  if (serviceKeywords.length === 0) {
    serviceKeywords = tokenize(description).filter((t) => !context.locationTokens.includes(t));
  }

  const service = pickPrimaryService(serviceKeywords) || serviceFromField.toLowerCase();
  const locationKeywords = [
    ...new Set(
      [
        ...tokenize(brief.location),
        ...context.locationTokens,
        locationCity,
        locationRegion,
      ]
        .filter(Boolean)
        .map((t) => t.toLowerCase())
        .filter((t) => !isStateAbbrev(t))
    ),
  ];

  const constraints = deriveConstraints(brief, intent);
  const nicheCategory = detectNicheCategory(serviceKeywords, brief.industry);
  const hasSubject =
    Boolean(service) ||
    nicheCategory !== "general" ||
    Boolean(brief.industry.trim()) ||
    Boolean(brief.productService.trim());
  const isLocalContext = Boolean(locationCity) || context.isLocalIntent;
  const literalness = resolveQueryLiteralness(brief);

  return {
    intent,
    description,
    industry: brief.industry.trim(),
    audience: brief.audience.trim(),
    service,
    locationCity: locationCity.toLowerCase(),
    locationRegion: locationRegion.toLowerCase(),
    personalName: brief.personalName.trim(),
    profession: brief.profession.trim(),
    currentDomain: brief.currentDomain.trim(),
    competitors: brief.competitors.trim(),
    marketScope: brief.marketScope.trim(),
    serviceKeywords,
    locationKeywords,
    nicheCategory,
    tones: brief.brandTones,
    constraints,
    tldPreference: deriveTlds(brief, intent, constraints),
    hasSubject,
    isLocalContext,
    literalness,
  };
}
