import type { AnalyzeFilters, DomainCandidate } from "@/lib/types/domain";
import { discoverDomainsFromQuery } from "@/lib/intelligence/discover-domains";
import { scoreDomain } from "@/lib/intelligence/score-domain";

type MarketplaceListing = {
  domain: string;
  price: number;
  priceType?: "registration" | "marketplace";
  available?: boolean;
};

type MarketplaceSearchResponse = {
  results?: MarketplaceListing[];
  listings?: MarketplaceListing[];
};

function getConfig() {
  return {
    url: process.env.NAMESILO_MARKETPLACE_API_URL,
    key: process.env.NAMESILO_MARKETPLACE_API_KEY,
  };
}

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value?.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeListing(listing: MarketplaceListing, query: string): DomainCandidate {
  return scoreDomain(
    listing.domain,
    query,
    listing.price,
    listing.priceType ?? "marketplace",
    listing.available ?? true
  );
}

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

export async function searchMarketplace(
  query: string,
  filters?: AnalyzeFilters
): Promise<{ candidates: DomainCandidate[]; usedFallback: boolean }> {
  const { url, key } = getConfig();

  if (isValidHttpUrl(url)) {
    try {
      const searchUrl = new URL(`${url.replace(/\/$/, "")}/search`);
      searchUrl.searchParams.set("q", query);
      if (filters?.maxPrice) searchUrl.searchParams.set("maxPrice", String(filters.maxPrice));
      if (filters?.tld) searchUrl.searchParams.set("tld", filters.tld.replace(".", ""));

      const headers: Record<string, string> = { Accept: "application/json" };
      if (key) headers.Authorization = `Bearer ${key}`;

      const res = await fetch(searchUrl.toString(), { headers, next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`Marketplace API ${res.status}`);

      const data = (await res.json()) as MarketplaceSearchResponse;
      const listings = data.results ?? data.listings ?? [];
      if (listings.length > 0) {
        const candidates = listings.map((l) => normalizeListing(l, query));
        return { candidates: applyFilters(candidates, filters), usedFallback: false };
      }
    } catch (err) {
      console.warn("[marketplace] API unavailable, using query-driven discovery:", err);
    }
  }

  const candidates = await discoverDomainsFromQuery(query, filters);
  return { candidates: applyFilters(candidates, filters), usedFallback: true };
}

export async function getMarketplaceListing(
  domain: string,
  query = ""
): Promise<DomainCandidate | null> {
  const { url, key } = getConfig();

  if (isValidHttpUrl(url)) {
    try {
      const listingUrl = `${url.replace(/\/$/, "")}/listing/${encodeURIComponent(domain)}`;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (key) headers.Authorization = `Bearer ${key}`;

      const res = await fetch(listingUrl, { headers, next: { revalidate: 60 } });
      if (res.ok) {
        const listing = (await res.json()) as MarketplaceListing;
        return normalizeListing(listing, query);
      }
    } catch {
      /* fall through */
    }
  }

  const tld = domain.split(".").pop() ?? "com";
  const price = tld === "com" ? 10.99 : 12.99;
  return scoreDomain(domain, query || domain, price, "registration", true);
}
