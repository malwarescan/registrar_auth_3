import type { AnalyzeFilters, DomainCandidate } from "@/lib/types/domain";
import type { DomainBrief } from "@/lib/types/domain-brief";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import type { GenerationPass, NamingLane } from "@/lib/types/naming";
import {
  generateCandidateDomains,
  generateLaneCandidateDomains,
  type LaneDomainCandidate,
} from "@/lib/intelligence/generate-candidates";
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
import {
  buildRegenerationMeta,
  expandRegenerationToDomains,
  mergeRegenerationCandidates,
  regenerateFromBenchmark,
  selectRegenerationSeeds,
  shouldTriggerRegeneration,
  type GenerationMeta,
} from "@/lib/intelligence/regeneration";

const DEMO_QUERY_PATTERN = /eco\s*home|smart\s*home|green\s*tech/i;

type DomainEntry = {
  domain: string;
  namingLane?: NamingLane;
  generationPass?: GenerationPass;
  seedDomain?: string;
};

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

function scoreDomainEntries(
  entries: DomainEntry[],
  availability: Record<string, boolean>,
  priceMap: Record<string, number>,
  query: string,
  intent: ReturnType<typeof resolveBuyingIntent>,
  brief: DomainBrief,
  apiConfigured: boolean,
  hadApiError: boolean
): DomainCandidate[] {
  return entries.map((entry) => {
    const { domain } = entry;
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
      ...(entry.namingLane ? { namingLane: entry.namingLane } : {}),
      ...(entry.generationPass ? { generationPass: entry.generationPass } : {}),
      ...(entry.seedDomain ? { seedDomain: entry.seedDomain } : {}),
    };
  });
}

function finalizeCandidates(
  candidates: DomainCandidate[],
  brief: DomainBrief,
  intent: ReturnType<typeof resolveBuyingIntent>,
  filters?: AnalyzeFilters
): DomainCandidate[] {
  const query = buildAnalysisQuery(brief);
  const context = extractNamingCriteria(brief);

  candidates = candidates.filter(
    (c) => c.signals.search >= 15 || c.signals.marketing >= 20 || c.signals.brand >= 55
  );

  const availableOnly = candidates.filter((c) => canPurchaseDomain(c));
  const takenPresets = candidates.filter((c) => c.availabilityStatus === "taken");

  if (availableOnly.length >= 3) {
    candidates = [
      ...availableOnly,
      ...takenPresets.filter((c) => c.signals.brand >= 60).slice(0, 6),
    ];
  }

  if (
    (context?.constraints.preferLocalSeo || intent === "local_service") &&
    context?.locationKeywords.length
  ) {
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

  return candidates;
}

function buildPass1Entries(brief: DomainBrief): DomainEntry[] {
  const laneDomains = generateLaneCandidateDomains(brief);
  if (laneDomains.length > 0) {
    return laneDomains.map((entry: LaneDomainCandidate) => ({
      domain: entry.domain,
      namingLane: entry.namingLane,
      generationPass: entry.generationPass,
    }));
  }
  return generateCandidateDomains(brief).map((domain) => ({
    domain,
    generationPass: 1 as const,
  }));
}

/**
 * Generate and score domain candidates from a full domain brief.
 * Uses intent-aware brandable generation + NameSilo availability/pricing.
 * Pass 2 regeneration runs when the buyable pool is thin or strong names are taken.
 */
export async function discoverDomainsFromBrief(
  brief: DomainBrief,
  filters?: AnalyzeFilters
): Promise<{ candidates: DomainCandidate[]; apiConfigured: boolean; generationMeta?: GenerationMeta }> {
  const query = buildAnalysisQuery(brief);
  const intent = resolveBuyingIntent(brief);
  const criteria = extractNamingCriteria(brief);
  const pass1Entries = buildPass1Entries(brief);

  if (pass1Entries.length === 0) {
    return {
      candidates: isDemoQuery(query) ? getSeedCandidates(query) : [],
      apiConfigured: Boolean(process.env.NAMESILO_API_KEY),
    };
  }

  const apiConfigured = Boolean(process.env.NAMESILO_API_KEY);
  const pass1Checked = pass1Entries.length;

  let availability: Record<string, boolean> = {};
  let priceMap: Record<string, number> = {};
  let hadApiError = false;

  if (apiConfigured) {
    try {
      [availability, priceMap] = await Promise.all([
        checkRegisterAvailability(pass1Entries.map((e) => e.domain)),
        getTldPrices(),
      ]);
    } catch (error) {
      console.error("[discoverDomainsFromBrief] availability check failed", error);
      hadApiError = true;
    }
  }

  let candidates = scoreDomainEntries(
    pass1Entries,
    availability,
    priceMap,
    query,
    intent,
    brief,
    apiConfigured,
    hadApiError
  );

  const buyableBeforeRegeneration = candidates.filter((c) => canPurchaseDomain(c)).length;
  let pass2Checked = 0;
  let regenerationTriggered = false;
  let regenerationSeeds: string[] = [];
  let lanesExpanded: NamingLane[] = [];

  if (apiConfigured && !hadApiError && criteria && shouldTriggerRegeneration({ candidates, criteria })) {
    const seeds = selectRegenerationSeeds(candidates, criteria);
    if (seeds.length > 0) {
      regenerationTriggered = true;
      regenerationSeeds = seeds.map((s) => s.domain);
      const labeled = regenerateFromBenchmark(seeds, criteria);
      lanesExpanded = [...new Set(labeled.map((l) => l.lane))];
      const alreadyChecked = new Set(pass1Entries.map((e) => e.domain.toLowerCase()));
      const pass2Entries = expandRegenerationToDomains(
        labeled,
        criteria.tldPreference,
        alreadyChecked
      );
      pass2Checked = pass2Entries.length;

      if (pass2Entries.length > 0) {
        try {
          const availability2 = await checkRegisterAvailability(pass2Entries.map((e) => e.domain));
          const pass2Candidates = scoreDomainEntries(
            pass2Entries,
            availability2,
            priceMap,
            query,
            intent,
            brief,
            apiConfigured,
            false
          );
          candidates = mergeRegenerationCandidates(candidates, pass2Candidates);
        } catch (error) {
          console.error("[discoverDomainsFromBrief] pass-2 availability check failed", error);
        }
      }
    }
  }

  const buyableAfterRegeneration = candidates.filter((c) => canPurchaseDomain(c)).length;
  const literalMeta = criteria
    ? {
        queryLiteralness: criteria.literalness.queryLiteralness,
        briefQuality: criteria.literalness.briefQuality,
        literalRootUsed: criteria.literalness.literalRootUsed,
        literalRoot: criteria.literalness.literalRoot,
        missingContextWarning: criteria.literalness.missingContextWarning,
      }
    : {
        queryLiteralness: "loose_context" as const,
        briefQuality: "weak" as const,
        literalRootUsed: false,
        literalRoot: null,
        missingContextWarning: null,
      };

  const generationMeta = buildRegenerationMeta({
    pass1Checked,
    pass2Checked,
    buyableCountBeforeRegeneration: buyableBeforeRegeneration,
    buyableCountAfterRegeneration: buyableAfterRegeneration,
    regenerationTriggered,
    regenerationSeeds,
    lanesExpanded,
    ...literalMeta,
  });

  candidates = finalizeCandidates(candidates, brief, intent, filters);

  if (candidates.length === 0 && isDemoQuery(query)) {
    return { candidates: getSeedCandidates(query), apiConfigured, generationMeta };
  }

  return { candidates: candidates.slice(0, 20), apiConfigured, generationMeta };
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

export type { GenerationMeta };
