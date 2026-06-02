import type { BuyingIntent, DomainBrief } from "@/lib/types/domain-brief";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import type { OptimizeMode } from "@/lib/types/domain";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import type { SearchMode } from "@/lib/search/search-config";

export type QueryLiteralness =
  | "loose_context"
  | "semantic_context"
  | "keyword_preferred"
  | "keyword_required"
  | "exact_partial_required";

export type BriefQuality = "strong" | "medium" | "weak";

export type InvestmentNamingMode = "broad_resale" | "literal_seed";

export type LiteralnessPolicy = {
  queryLiteralness: QueryLiteralness;
  briefQuality: BriefQuality;
  literalRootUsed: boolean;
  literalRoot: string | null;
  missingContextWarning: string | null;
  investmentMode: InvestmentNamingMode | null;
};

const STOP = new Set([
  "a", "an", "the", "for", "and", "or", "of", "to", "in", "at", "on", "with", "by",
  "company", "business", "brand", "store", "service", "services", "system", "systems",
]);

/** High-signal single-word seeds that should anchor generation, not become loose context. */
export const SHORT_HIGH_SIGNAL_SEEDS = new Set([
  "meta",
  "cloud",
  "ai",
  "agent",
  "home",
  "crypto",
  "legal",
  "health",
  "security",
  "data",
  "web",
  "tech",
  "app",
  "shop",
  "pay",
  "fin",
  "bio",
  "dev",
]);

export const KEYWORD_ROOT_SUFFIXES = [
  "Nest",
  "Forge",
  "Grid",
  "Signal",
  "Pilot",
  "Flow",
  "Stack",
  "Loop",
  "Labs",
  "Works",
  "Market",
  "Brands",
  "Names",
  "Direct",
  "HQ",
  "Vault",
  "Base",
  "Layer",
  "Engine",
  "Hub",
  "Port",
  "Sync",
  "Core",
  "Link",
];

export const KEYWORD_ROOT_PREFIXES = ["Get", "My", "Go", "Pro", "Smart", "True", "Ultra"];

/** Semantic companions when a short seed should drive brandable compounds (not home/security). */
export const SEED_COMPANION_WORDS: Record<string, string[]> = {
  meta: [
    "Data",
    "Layer",
    "Signal",
    "Grid",
    "Forge",
    "Stack",
    "Flow",
    "Labs",
    "Works",
    "Protocol",
    "Registry",
    "Network",
    "Identity",
    "Intelligence",
    "Vault",
    "Pilot",
    "Loop",
    "Market",
    "Names",
    "Brands",
    "Domains",
  ],
  cloud: ["Stack", "Forge", "Grid", "Flow", "Port", "Sync", "Base", "Hub", "Works", "Labs"],
  ai: ["Forge", "Grid", "Flow", "Stack", "Pilot", "Signal", "Labs", "Works", "Agent", "Core"],
  agent: ["Flow", "Grid", "Stack", "Forge", "Pilot", "Works", "Labs", "Hub"],
  crypto: ["Vault", "Grid", "Flow", "Stack", "Forge", "Market", "Hub", "Works"],
  data: ["Grid", "Flow", "Stack", "Forge", "Layer", "Hub", "Works", "Labs", "Signal"],
};

export const DEFAULT_COMPANION_WORDS = [
  "Forge",
  "Grid",
  "Signal",
  "Flow",
  "Stack",
  "Labs",
  "Works",
  "Direct",
  "Hub",
  "Vault",
  "Pilot",
  "Loop",
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, " ")
    .split(/[\s,_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function countContextFields(brief: DomainBrief): number {
  let n = 0;
  if (brief.industry.trim()) n += 1;
  if (brief.audience.trim()) n += 1;
  if (brief.productService.trim()) n += 1;
  if (brief.location.trim()) n += 1;
  if (brief.competitors.trim()) n += 1;
  if (brief.marketScope.trim()) n += 1;
  return n;
}

function inferOptimizeMode(brief: DomainBrief): OptimizeMode | null {
  const w = brief.priorityWeights;
  let best: OptimizeMode | null = null;
  let bestDelta = 0;
  for (const [mode, preset] of Object.entries(OPTIMIZE_PRESETS) as [OptimizeMode, typeof w][]) {
    const delta = (Object.keys(w) as (keyof typeof w)[]).reduce(
      (sum, key) => sum + Math.abs(w[key] - preset[key]),
      0
    );
    if (delta < 0.01) return mode;
    if (best === null || delta < bestDelta) {
      best = mode;
      bestDelta = delta;
    }
  }
  return best;
}

function isShortSeedWord(token: string): boolean {
  const norm = token.toLowerCase();
  return norm.length <= 12 && (SHORT_HIGH_SIGNAL_SEEDS.has(norm) || norm.length <= 6);
}

function isKeywordLiteralness(level: QueryLiteralness): boolean {
  return level === "keyword_preferred" || level === "keyword_required";
}

export function assessBriefQuality(brief: DomainBrief, tokens: string[]): BriefQuality {
  const contextFields = countContextFields(brief);
  const hasMultiWordQuery = tokens.length >= 3;
  const hasTwoWordQuery = tokens.length >= 2;
  const hasRichContext = contextFields >= 2 || Boolean(brief.productService.trim() && brief.industry.trim());

  if (hasMultiWordQuery || hasRichContext) return "strong";
  if (hasTwoWordQuery || contextFields >= 1 || tokens.length === 1 && !isShortSeedWord(tokens[0])) {
    return "medium";
  }
  return "weak";
}

export function resolveQueryLiteralness(brief: DomainBrief): LiteralnessPolicy {
  const intent = resolveBuyingIntent(brief);
  const description = brief.naming.trim();
  const tokens = tokenize(description);
  const briefQuality = assessBriefQuality(brief, tokens);
  const contextFields = countContextFields(brief);
  const preferExact = brief.requirements.includes("exact match");
  const preferKeywordSlug =
    brief.requirements.includes("local SEO") ||
    brief.seoGoals.some((g) => /exact-match|keyword|slug/i.test(g));
  const optimizeMode = inferOptimizeMode(brief);
  const searchMode = brief.searchMode as SearchMode;

  const primaryToken = tokens[0] ?? null;
  const shortSingleSeed =
    tokens.length === 1 && primaryToken !== null && isShortSeedWord(primaryToken);

  let missingContextWarning: string | null = null;

  if (intent === "seo_content" || preferExact || preferKeywordSlug || optimizeMode === "seo") {
    return {
      queryLiteralness: "exact_partial_required",
      briefQuality,
      literalRootUsed: tokens.length > 0,
      literalRoot: primaryToken,
      missingContextWarning: null,
      investmentMode: null,
    };
  }

  if (intent === "local_service") {
    const hasService = Boolean(brief.productService.trim() || tokens.some((t) => t.length > 3));
    const hasLocation = Boolean(brief.location.trim());
    if (!hasService || !hasLocation) {
      missingContextWarning =
        "This query is broad. Add a service, city, or region for stronger local-service names.";
    }
    return {
      queryLiteralness: hasService && hasLocation ? "semantic_context" : "keyword_preferred",
      briefQuality,
      literalRootUsed: Boolean(primaryToken),
      literalRoot: primaryToken,
      missingContextWarning,
      investmentMode: null,
    };
  }

  if (intent === "domain_investment") {
    const categoryStyle =
      tokens.length >= 2 ||
      contextFields >= 1 ||
      searchMode === "investor_research" ||
      optimizeMode === "resale" && !shortSingleSeed;

    if (shortSingleSeed || (tokens.length === 1 && primaryToken && primaryToken.length <= 10)) {
      return {
        queryLiteralness: "keyword_preferred",
        briefQuality,
        literalRootUsed: true,
        literalRoot: primaryToken,
        missingContextWarning:
          briefQuality === "weak"
            ? "This query is broad. Add an industry, audience, or desired use case for stronger results."
            : null,
        investmentMode: "literal_seed",
      };
    }

    if (categoryStyle) {
      return {
        queryLiteralness: tokens.length >= 2 ? "semantic_context" : "loose_context",
        briefQuality,
        literalRootUsed: Boolean(primaryToken),
        literalRoot: primaryToken,
        missingContextWarning:
          briefQuality === "weak"
            ? "This query is broad. Add an industry, audience, or desired use case for stronger results."
            : null,
        investmentMode: "broad_resale",
      };
    }

    return {
      queryLiteralness: "keyword_preferred",
      briefQuality,
      literalRootUsed: Boolean(primaryToken),
      literalRoot: primaryToken,
      missingContextWarning: null,
      investmentMode: "literal_seed",
    };
  }

  if (intent === "business_brand" || intent === "saas_app") {
    if (shortSingleSeed) {
      return {
        queryLiteralness: "keyword_preferred",
        briefQuality,
        literalRootUsed: true,
        literalRoot: primaryToken,
        missingContextWarning:
          briefQuality === "weak"
            ? "This query is broad. Add an industry, audience, or desired use case for stronger results."
            : null,
        investmentMode: null,
      };
    }
    if (tokens.length >= 3 || contextFields >= 1) {
      return {
        queryLiteralness: "semantic_context",
        briefQuality,
        literalRootUsed: false,
        literalRoot: null,
        missingContextWarning: null,
        investmentMode: null,
      };
    }
    return {
      queryLiteralness: tokens.length === 2 ? "semantic_context" : "loose_context",
      briefQuality,
      literalRootUsed: Boolean(primaryToken),
      literalRoot: primaryToken,
      missingContextWarning:
        briefQuality === "weak"
          ? "This query is broad. Add an industry, audience, or desired use case for stronger results."
          : null,
      investmentMode: null,
    };
  }

  if (preferExact || brief.requirements.some((r) => /keyword|exact/i.test(r))) {
    return {
      queryLiteralness: "keyword_required",
      briefQuality,
      literalRootUsed: Boolean(primaryToken),
      literalRoot: primaryToken,
      missingContextWarning: null,
      investmentMode: null,
    };
  }

  return {
    queryLiteralness:
      tokens.length >= 3 ? "semantic_context" : tokens.length === 2 ? "semantic_context" : "loose_context",
    briefQuality,
    literalRootUsed: Boolean(primaryToken) && shortSingleSeed,
    literalRoot: shortSingleSeed ? primaryToken : null,
    missingContextWarning:
      briefQuality === "weak" && tokens.length <= 1
        ? "This query is broad. Add an industry, audience, or desired use case for stronger results."
        : null,
    investmentMode: null,
  };
}

export function usesLiteralRoot(policy: LiteralnessPolicy): boolean {
  return (
    policy.literalRootUsed &&
    policy.literalRoot !== null &&
    isKeywordLiteralness(policy.queryLiteralness)
  );
}

export function corpusHasHomeSecurityConcepts(corpus: string): boolean {
  return /home\s*security|security\s*system|alarm|surveillance|protect|guard|shield|nest|haven/i.test(
    corpus
  );
}
