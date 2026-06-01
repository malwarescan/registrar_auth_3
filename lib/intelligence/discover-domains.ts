import type { AnalyzeFilters, DomainCandidate } from "@/lib/types/domain";
import type { DomainBrief } from "@/lib/types/domain-brief";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import { generateCandidateDomains } from "@/lib/intelligence/generate-candidates";
import { extractNamingCriteria } from "@/lib/intelligence/naming-criteria";
import { labelIncludesLocation, parseDomain } from "@/lib/intelligence/parse-domain";
import { scoreDomain, compositeScore } from "@/lib/intelligence/score-domain";
import { deriveWeightsFromBrief, buildAnalysisQuery } from "@/lib/intelligence/brief-to-weights";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import {
  checkRegisterAvailability,
  getTldPrices,
} from "@/lib/namesilo/public-api-client";
import { getSeedCandidates } from "@/lib/intelligence/seed-data";
import { canPurchaseDomain } from "@/lib/domains/availability";

const DEMO_QUERY_PATTERN = /eco\s*home|smart\s*home|green\s*tech/i;

function isDemoQuery(query: string): boolean {
  return DEMO_QUERY_PATTERN.test(query);
}

function defaultPriceForTld(tld: string, priceMap: Record<string, number>): number {
  return priceMap[tld] ?? (tld === "com" ? 10.99 : 12.99);
}

function availabilityStatus(
  available: boolean,
  priceType: "registration" | "marketplace",
  apiConfigured: boolean,
  hadApiError: boolean
): DomainCandidate["availabilityStatus"] {
  if (hadApiError) return apiConfigured ? "api_error" : "idea_only";
  if (!apiConfigured) return "idea_only";
  if (!available) return "taken";
  if (priceType === "marketplace") return "marketplace_available";
  return "available";
}

/**
 * Generate and score domain candidates from a full domain brief.
 * Uses intent-aware brandable generation + NameSilo availability/pricing.
 */
export async function discoverDomainsFromBrief(
  brief: DomainBrief,
  filters?: AnalyzeFilters
): Promise<{ candidates: DomainCandidate[]; apiConfigured: boolean }> {
  const query = buildAnalysisQuery(brief);
  const intent = resolveBuyingIntent(brief);
  const domainNames = generateCandidateDomains(brief);

  if (domainNames.length === 0) {
    return {
      candidates: isDemoQuery(query) ? getSeedCandidates(query) : [],
      apiConfigured: Boolean(process.env.NAMESILO_API_KEY),
    };
  }

  const apiConfigured = Boolean(process.env.NAMESILO_API_KEY);

  let availability: Record<string, boolean> = {};
  let priceMap: Record<string, number> = {};
  let hadApiError = false;

  if (apiConfigured) {
    try {
      [availability, priceMap] = await Promise.all([
        checkRegisterAvailability(domainNames),
        getTldPrices(),
      ]);
    } catch (error) {
      console.error("[discoverDomainsFromBrief] availability check failed", error);
      hadApiError = true;
    }
  }

  let candidates = domainNames.map((domain) => {
    const tld = domain.split(".").pop() ?? "com";
    const available = apiConfigured && !hadApiError ? (availability[domain] ?? false) : false;
    const price = defaultPriceForTld(tld, priceMap);
    const scored = scoreDomain(domain, query, price, "registration", available, {
      intent,
      brandablePreferred: intent !== "seo_content" && !brief.requirements.includes("exact match"),
    });
    return {
      ...scored,
      availabilityStatus: availabilityStatus(available, "registration", apiConfigured, hadApiError),
    };
  });

  // Prefer available; hide irrelevant results
  candidates = candidates.filter(
    (c) => c.signals.search >= 15 || c.signals.marketing >= 20 || c.signals.brand >= 55
  );

  const availableOnly = candidates.filter((c) => canPurchaseDomain(c));
  const takenPresets = candidates.filter((c) => c.availabilityStatus === "taken");

  if (availableOnly.length >= 3) {
    // Show available first, then up to 6 taken presets as benchmarks
    candidates = [
      ...availableOnly,
      ...takenPresets.filter((c) => c.signals.brand >= 60).slice(0, 6),
    ];
  }

  const context = extractNamingCriteria(brief);
  if ((context?.constraints.preferLocalSeo || intent === "local_service") && context?.locationKeywords.length) {
    const withLocation = candidates.filter((c) =>
      labelIncludesLocation(parseDomain(c.domain).label, context.locationKeywords)
    );
    if (withLocation.length >= 2) {
      candidates = [...withLocation, ...candidates.filter((c) => !withLocation.includes(c))];
    }
  }

  if (filters?.maxPrice) {
    candidates = candidates.filter((c) => c.price <= filters.maxPrice!);
  }

  const weights = deriveWeightsFromBrief(brief);
  candidates.sort((a, b) => compositeScore(b, weights) - compositeScore(a, weights));

  if (candidates.length === 0 && isDemoQuery(query)) {
    return { candidates: getSeedCandidates(query), apiConfigured };
  }

  return { candidates: candidates.slice(0, 20), apiConfigured };
}

/** @deprecated use discoverDomainsFromBrief */
export async function discoverDomainsFromQuery(
  query: string,
  filters?: AnalyzeFilters
): Promise<DomainCandidate[]> {
  const brief: DomainBrief = {
    naming: query,
    buyingIntent: null,
    searchGoal: null,
    searchMode: "business_idea",
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
    maxPrice: filters?.maxPrice ?? 5000,
    tldPreference: filters?.tld?.replace(".", "") ?? "any",
    buyNowOnly: false,
    premiumAllowed: true,
    resaleImportance: false,
    priorityWeights: OPTIMIZE_PRESETS.overall,
  };
  const { candidates } = await discoverDomainsFromBrief(brief, filters);
  return candidates;
}
