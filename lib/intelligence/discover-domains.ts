import type { AnalyzeFilters, DomainCandidate } from "@/lib/types/domain";
import { generateDomainNames } from "@/lib/intelligence/parse-domain";
import { scoreDomain, compositeScore } from "@/lib/intelligence/score-domain";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import {
  checkRegisterAvailability,
  getTldPrices,
} from "@/lib/namesilo/public-api-client";
import { getSeedCandidates } from "@/lib/intelligence/seed-data";

const DEMO_QUERY_PATTERN = /eco\s*home|smart\s*home|green\s*tech/i;

function isDemoQuery(query: string): boolean {
  return DEMO_QUERY_PATTERN.test(query);
}

function defaultPriceForTld(tld: string, priceMap: Record<string, number>): number {
  return priceMap[tld] ?? (tld === "com" ? 10.99 : 12.99);
}

/**
 * Generate and score domain candidates from the user's query.
 * Uses NameSilo availability + registration pricing when configured.
 */
export async function discoverDomainsFromQuery(
  query: string,
  filters?: AnalyzeFilters
): Promise<DomainCandidate[]> {
  const tldFilter = filters?.tld?.replace(/^\./, "");
  const domainNames = generateDomainNames(query, tldFilter);

  if (domainNames.length === 0) {
    return isDemoQuery(query) ? getSeedCandidates(query) : [];
  }

  const [availability, priceMap] = await Promise.all([
    checkRegisterAvailability(domainNames),
    getTldPrices(),
  ]);

  let candidates = domainNames.map((domain) => {
    const tld = domain.split(".").pop() ?? "com";
    const available = availability[domain] ?? false;
    const price = defaultPriceForTld(tld, priceMap);
    return scoreDomain(domain, query, price, "registration", available);
  });

  // Prefer available domains; hide clearly irrelevant results
  candidates = candidates.filter(
    (c) => c.signals.search >= 20 || c.signals.marketing >= 25
  );

  if (filters?.maxPrice) {
    candidates = candidates.filter((c) => c.price <= filters.maxPrice!);
  }

  candidates.sort((a, b) => compositeScore(b, OPTIMIZE_PRESETS.overall) - compositeScore(a, OPTIMIZE_PRESETS.overall));

  if (candidates.length === 0 && isDemoQuery(query)) {
    return getSeedCandidates(query);
  }

  return candidates.slice(0, 12);
}
