import type { BenchmarkDelta, PinRecommendation } from "@/lib/types/domain-brief";
import type { DomainCandidate, DomainRankings, SignalWeights, SignalWinner } from "@/lib/types/domain";
import { compositeScore } from "./score-domain";
import { parseDomain } from "./parse-domain";
import { isRecommendationEligible } from "@/lib/domains/availability";

export function getSystemPinned(
  candidates: DomainCandidate[],
  weights: SignalWeights
): DomainCandidate | null {
  const pool = candidates.filter((c) => isRecommendationEligible(c));
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => compositeScore(b, weights) - compositeScore(a, weights))[0];
}

export function buildPinRecommendation(
  pinned: DomainCandidate,
  candidates: DomainCandidate[],
  weights: SignalWeights,
  rankings: Record<string, DomainRankings>,
  winners: SignalWinner[]
): PinRecommendation {
  const pinnedRank = rankings[pinned.domain];
  const wins: string[] = [];
  if (pinnedRank?.brand === 1) wins.push("#1 Brand Strength");
  if (pinnedRank?.seo === 1) wins.push("#1 SEO Fit");
  if (pinnedRank?.ai === 1) wins.push("#1 AI Visibility");
  if (pinnedRank?.trust === 1) wins.push("#1 Trust");
  if (pinnedRank?.value === 1) wins.push("#1 Value");
  if (pinnedRank?.resale === 1) wins.push("#1 Resale Potential");
  if (pinnedRank?.overall === 1) wins.push("#1 Overall");
  if (wins.length === 0 && pinnedRank) {
    if (pinnedRank.brand <= 2) wins.push(`#${pinnedRank.brand} Brand Strength`);
    if (pinnedRank.trust <= 2) wins.push(`#${pinnedRank.trust} Trust`);
    if (pinnedRank.overall <= 2) wins.push(`#${pinnedRank.overall} Overall`);
  }

  const seoWinner = winners.find((w) => w.id === "seo");
  const valueWinner = winners.find((w) => w.id === "value");
  const brandWinner = winners.find((w) => w.id === "brand");

  let tradeoff = "Balanced tradeoffs across your selected priorities.";
  if (seoWinner && seoWinner.domain !== pinned.domain && pinned.signals.search < seoWinner.score - 5) {
    tradeoff = `Lower exact-match SEO than ${seoWinner.domain}.`;
  } else if (brandWinner && brandWinner.domain !== pinned.domain && pinned.signals.brand < brandWinner.score - 5) {
    tradeoff = `Less brandable than ${brandWinner.domain} for long-term equity.`;
  } else if (valueWinner && valueWinner.domain !== pinned.domain && (pinned.valueScore ?? 0) < valueWinner.score - 5) {
    tradeoff = `Higher price than ${valueWinner.domain} for similar signal strength.`;
  }

  const alternatives: PinRecommendation["alternatives"] = [];
  if (seoWinner && seoWinner.domain !== pinned.domain) {
    alternatives.push({ domain: seoWinner.domain, reason: "Better SEO fit", price: seoWinner.price });
  }
  if (valueWinner && valueWinner.domain !== pinned.domain) {
    alternatives.push({ domain: valueWinner.domain, reason: "Better value", price: valueWinner.price });
  }
  if (brandWinner && brandWinner.domain !== pinned.domain) {
    alternatives.push({ domain: brandWinner.domain, reason: "Stronger brand", price: brandWinner.price });
  }

  const parsed = parseDomain(pinned.domain);
  const recommendedIf =
    pinned.signals.brand >= pinned.signals.search
      ? "You care most about long-term brand equity and mainstream trust."
      : "You care most about search intent capture and keyword relevance.";

  return {
    domain: pinned,
    score: compositeScore(pinned, weights),
    whyPinned: `Best overall balance for your strategy — strong on ${wins.slice(0, 2).join(" and ") || "key signals"}.`,
    wins: wins.slice(0, 4),
    tradeoff,
    recommendedIf,
    alternatives: alternatives.slice(0, 3),
  };
}

export function buildBenchmarkDeltas(
  benchmark: DomainCandidate,
  candidates: DomainCandidate[]
): BenchmarkDelta[] {
  const b = benchmark.signals;
  const bValue = benchmark.valueScore ?? 0;

  return candidates
    .filter((c) => c.domain !== benchmark.domain)
    .map((c) => {
      const parts: string[] = [];
      const brand = c.signals.brand - b.brand;
      const seo = c.signals.search - b.search;
      const ai = c.signals.ai - b.ai;
      const trust = c.signals.trust - b.trust;
      const value = (c.valueScore ?? 0) - bValue;
      const priceDiff = c.price - benchmark.price;

      if (brand >= 5) parts.push(`+${brand} brand strength`);
      if (brand <= -5) parts.push(`${brand} brand strength`);
      if (seo >= 5) parts.push(`+${seo} SEO relevance`);
      if (seo <= -5) parts.push(`${seo} SEO relevance`);
      if (ai >= 5) parts.push(`+${ai} AI clarity`);
      if (trust >= 5) parts.push(`+${trust} trust`);
      if (priceDiff > 0) parts.push("higher price");
      if (priceDiff < -50) parts.push("lower price");

      return {
        domain: c.domain,
        price: c.price,
        brand,
        seo,
        ai,
        trust,
        value,
        priceDiff,
        summary: parts.length > 0 ? parts.join(", ") : "Similar profile to benchmark",
      };
    })
    .sort((a, b) => {
      const scoreA = a.brand + a.seo + a.ai + a.trust;
      const scoreB = b.brand + b.seo + b.ai + b.trust;
      return scoreB - scoreA;
    });
}

export function findBetterThanBenchmark(
  benchmark: DomainCandidate,
  candidates: DomainCandidate[],
  dimension: "brand" | "seo" | "ai" | "trust" | "value"
): DomainCandidate | null {
  const key =
    dimension === "seo" ? "search" : dimension === "value" ? "valueScore" : dimension;
  const benchVal =
    dimension === "value" ? benchmark.valueScore ?? 0 : benchmark.signals[key as keyof typeof benchmark.signals];

  const better = candidates
    .filter((c) => c.domain !== benchmark.domain)
    .filter((c) => {
      const val = dimension === "value" ? c.valueScore ?? 0 : c.signals[key as keyof typeof c.signals];
      return (val as number) > (benchVal as number) + 3;
    })
    .sort((a, b) => {
      const va = dimension === "value" ? a.valueScore ?? 0 : a.signals[key as keyof typeof a.signals];
      const vb = dimension === "value" ? b.valueScore ?? 0 : b.signals[key as keyof typeof b.signals];
      return (vb as number) - (va as number);
    });

  return better[0] ?? null;
}
