import type { CompareResponse, DomainCandidate } from "@/lib/types/domain";
import { pickDecisionStack } from "./score-domain";

function rankDomains(candidates: DomainCandidate[], key: "brand" | "search" | "ai") {
  const signalKey = key === "brand" ? "brand" : key === "search" ? "search" : "ai";
  const sorted = [...candidates].sort(
    (a, b) => b.signals[signalKey] - a.signals[signalKey]
  );
  const rankings: Record<string, { brand: number; seo: number; ai: number }> = {};
  for (const c of candidates) {
    rankings[c.domain] = { brand: 0, seo: 0, ai: 0 };
  }
  const brandSorted = [...candidates].sort((a, b) => b.signals.brand - a.signals.brand);
  const seoSorted = [...candidates].sort((a, b) => b.signals.search - a.signals.search);
  const aiSorted = [...candidates].sort((a, b) => b.signals.ai - a.signals.ai);
  brandSorted.forEach((c, i) => { rankings[c.domain].brand = i + 1; });
  seoSorted.forEach((c, i) => { rankings[c.domain].seo = i + 1; });
  aiSorted.forEach((c, i) => { rankings[c.domain].ai = i + 1; });
  return { sorted, rankings };
}

export function buildCompareResponse(candidates: DomainCandidate[]): CompareResponse {
  const { rankings } = rankDomains(candidates, "brand");
  const stack = pickDecisionStack(candidates);

  const tradeoffPoints = candidates.map((c) => ({
    domain: c.domain,
    brandStrength: c.signals.brand,
    searchRelevance: c.signals.search,
  }));

  const bestBrand = stack.brand;
  const bestSeo = stack.seo;
  const bestBalance = [...candidates].sort(
    (a, b) =>
      (b.signals.brand + b.signals.search + b.signals.ai) / 3 -
      (a.signals.brand + a.signals.search + a.signals.ai) / 3
  )[0];

  const summary = `${bestBrand.domain} is the strongest brand choice; ${bestBalance.domain} is the best value balance.`;

  return {
    domains: candidates,
    rankings,
    tradeoffPoints,
    decisions: [
      {
        id: "brand",
        title: "Option A: Brand Focus",
        description: `Choose ${bestBrand.domain} for long-term brand equity.`,
        domain: bestBrand.domain,
        icon: "brand",
      },
      {
        id: "seo",
        title: "Option B: Search/Value Focus",
        description: `Choose ${bestSeo.domain} for high keyword clarity and value.`,
        domain: bestSeo.domain,
        icon: "search",
      },
      {
        id: "balance",
        title: "Option C: Exact-Match Focus",
        description: `Choose ${bestBalance.domain} for a balance of brand and keywords with a modern TLD.`,
        domain: bestBalance.domain,
        icon: "balance",
      },
    ],
    summary,
  };
}
