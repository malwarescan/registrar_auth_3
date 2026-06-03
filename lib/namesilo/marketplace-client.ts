import type { DomainBrief } from "@/lib/types/domain-brief";
import type { AnalyzeFilters, DomainCandidate } from "@/lib/types/domain";
import { discoverDomainsFromBrief, type GenerationMeta } from "@/lib/intelligence/discover-domains";
import { buildAnalysisQuery, deriveWeightsFromBrief } from "@/lib/intelligence/brief-to-weights";
import { compositeScore, scoreDomain } from "@/lib/intelligence/score-domain";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import {
  checkRegisterAvailability,
  getTldPrices,
  searchAuctionListings,
} from "@/lib/namesilo/public-api-client";
import {
  resolveRegistrationAvailabilityStatus,
  resolveRegistrationPrice,
} from "@/lib/namesilo/pricing";

function applyFilters(candidates: DomainCandidate[], filters?: AnalyzeFilters): DomainCandidate[] {
  let filtered = candidates;
  if (filters?.maxPrice) {
    filtered = filtered.filter((c) => c.price <= filters.maxPrice!);
  }
  if (filters?.tld) {
    const tld = filters.tld.replace(".", "").toLowerCase();
    filtered = filtered.filter((c) => c.domain.toLowerCase().endsWith(`.${tld}`));
  }
  return filtered;
}

function mergeCandidates(
  registration: DomainCandidate[],
  marketplace: DomainCandidate[]
): DomainCandidate[] {
  const byDomain = new Map<string, DomainCandidate>();
  for (const c of registration) {
    byDomain.set(c.domain.toLowerCase(), c);
  }
  for (const c of marketplace) {
    const key = c.domain.toLowerCase();
    byDomain.set(key, c);
  }
  return [...byDomain.values()];
}

export async function searchMarketplace(
  brief: DomainBrief,
  filters?: AnalyzeFilters
): Promise<{
  candidates: DomainCandidate[];
  dataSource: "marketplace" | "registration";
  dataSourceNote: string;
  apiConfigured: boolean;
  generationMeta?: GenerationMeta;
}> {
  const query = buildAnalysisQuery(brief);
  const intent = resolveBuyingIntent(brief);
  const weights = deriveWeightsFromBrief(brief);

  const [{ candidates: registrationCandidates, apiConfigured, generationMeta }, auctionListings] =
    await Promise.all([
      discoverDomainsFromBrief(brief, filters),
      searchAuctionListings(query, { pageSize: 20, maxPrice: filters?.maxPrice }),
    ]);

  const marketplaceCandidates = auctionListings.map((listing) =>
    scoreDomain(listing.domain, query, listing.price, "marketplace", true, { intent })
  );

  const candidates = applyFilters(
    mergeCandidates(registrationCandidates, marketplaceCandidates),
    filters
  );

  candidates.sort((a, b) => compositeScore(b, weights) - compositeScore(a, weights));

  const hasMarketplace = marketplaceCandidates.length > 0;
  const hasApiErrorStatus = candidates.some(
    (c) => c.availabilityStatus === "api_error" || c.availabilityStatus === "unknown"
  );

  let dataSourceNote: string;
  if (!apiConfigured) {
    dataSourceNote =
      "Availability check disabled — generated candidates are idea-only until NAMESILO_API_KEY is configured.";
  } else if (hasApiErrorStatus) {
    dataSourceNote =
      "Availability checks encountered NameSilo API errors for some candidates. Unverified domains are clearly marked and are not buyable.";
  } else if (hasMarketplace) {
    dataSourceNote =
      "Verified through NameSilo API — registration availability, pricing, and marketplace listings.";
  } else {
    dataSourceNote =
      "Registration availability is verified through NameSilo. Premium marketplace listings are not included in this response.";
  }

  return {
    candidates,
    dataSource: hasMarketplace ? "marketplace" : "registration",
    dataSourceNote,
    apiConfigured,
    generationMeta,
  };
}

export async function getMarketplaceListing(
  domain: string,
  query = ""
): Promise<DomainCandidate | null> {
  const normalized = domain.trim().toLowerCase();
  if (!normalized.includes(".")) return null;

  const apiConfigured = Boolean(process.env.NAMESILO_API_KEY);
  const [availabilityMap, tldPrices] = await Promise.all([
    checkRegisterAvailability([normalized]),
    getTldPrices(),
  ]);

  const availabilityEntry = availabilityMap[normalized];
  const tld = normalized.split(".").pop() ?? "com";
  const available = availabilityEntry?.available ?? false;

  if (available) {
    const resolvedPrice = resolveRegistrationPrice(normalized, availabilityEntry, tldPrices);
    const price = resolvedPrice ?? 0;
    const scored = scoreDomain(normalized, query || normalized, price, "registration", true);
    return {
      ...scored,
      availabilityStatus: resolveRegistrationAvailabilityStatus(
        true,
        resolvedPrice,
        tld,
        tldPrices,
        apiConfigured,
        false
      ),
    };
  }

  const auctions = await searchAuctionListings(query || normalized.split(".")[0], { pageSize: 50 });
  const match = auctions.find((a) => a.domain === normalized);
  if (match) {
    return scoreDomain(normalized, query || normalized, match.price, "marketplace", true);
  }

  const referencePrice = resolveRegistrationPrice(normalized, availabilityEntry, tldPrices) ?? 0;
  const scored = scoreDomain(normalized, query || normalized, referencePrice, "registration", false);
  return {
    ...scored,
    availabilityStatus: apiConfigured ? "taken" : "unknown",
  };
}
