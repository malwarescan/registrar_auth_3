import type {
  DashboardView,
  DomainCandidate,
  DomainRankings,
  GraphPoint,
  OptimizeMode,
  RankingDimension,
  SignalEvidence,
  SignalScores,
  SignalWeights,
  SignalWinner,
} from "@/lib/types/domain";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import { compositeScore, computeValueScore, computeRiskScore, sortByOptimizeMode } from "./score-domain";
import { parseDomain } from "./parse-domain";
import { isBenchmarkOnly, isRecommendationEligible } from "@/lib/domains/availability";

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export { computeRiskScore } from "./score-domain";

export function computeAmbiguityRisk(signals: SignalScores): number {
  return clamp(100 - signals.ai);
}

export function enrichCandidate(candidate: DomainCandidate): DomainCandidate {
  const riskScore = computeRiskScore(candidate.signals, candidate.domain);
  const ambiguityRisk = computeAmbiguityRisk(candidate.signals);
  const valueScore = candidate.valueScore ?? computeValueScore(candidate.signals, candidate.price);
  return {
    ...candidate,
    valueScore,
    riskScore,
    ambiguityRisk,
    analysis: {
      ...candidate.analysis,
      signalEvidence: candidate.analysis.signalEvidence ?? buildSignalEvidence(candidate),
    },
  };
}

function buildSignalEvidence(candidate: DomainCandidate): SignalEvidence {
  const s = candidate.signals;
  const parsed = parseDomain(candidate.domain);
  return {
    brand:
      s.brand >= 80
        ? "Short, memorable label with strong verbal recall."
        : s.brand >= 65
          ? "Decent brandability with room to build equity."
          : "Longer or less distinctive; brand building may cost more.",
    marketing:
      s.marketing >= 80
        ? "Clear value proposition for target buyers."
        : "Moderate clarity; messaging may need refinement.",
    seo:
      s.search >= 85
        ? "Strong keyword alignment for search intent capture."
        : s.search >= 70
          ? "Solid search relevance with some keyword overlap."
          : "Weaker exact-match or intent alignment.",
    ai:
      s.ai >= 85
        ? "High entity clarity for semantic indexing and AI retrieval."
        : "Moderate AI/entity clarity; may need structured data support.",
    trust:
      s.trust >= 85
        ? `.${parsed.tld} carries mainstream buyer trust.`
        : s.trust >= 65
          ? "Acceptable trust profile for digital-first audiences."
          : `.${parsed.tld} may reduce initial consumer trust vs .com.`,
    value:
      (candidate.valueScore ?? 0) >= 80
        ? "Strong price-to-signal ratio for acquisition cost."
        : "Premium pricing relative to signal strength.",
    resale:
      s.resale >= 75
        ? "Good resale potential due to TLD and length profile."
        : "Moderate resale value; TLD may limit exit options.",
    risk:
      (candidate.riskScore ?? computeRiskScore(s, candidate.domain)) <= 25
        ? "Low acquisition risk profile."
        : (candidate.riskScore ?? 50) <= 45
          ? "Medium risk; validate audience and TLD fit."
          : "Higher risk from TLD, length, or trust factors.",
  };
}

function rankBy(
  candidates: DomainCandidate[],
  scoreFn: (c: DomainCandidate) => number,
  ascending = false
): Record<string, number> {
  const sorted = [...candidates].sort((a, b) =>
    ascending ? scoreFn(a) - scoreFn(b) : scoreFn(b) - scoreFn(a)
  );
  const ranks: Record<string, number> = {};
  sorted.forEach((c, i) => {
    ranks[c.domain] = i + 1;
  });
  return ranks;
}

export function buildRankings(
  candidates: DomainCandidate[],
  weights: SignalWeights
): Record<string, DomainRankings> {
  const enriched = candidates.map(enrichCandidate);
  const brandR = rankBy(enriched, (c) => c.signals.brand);
  const seoR = rankBy(enriched, (c) => c.signals.search);
  const aiR = rankBy(enriched, (c) => c.signals.ai);
  const trustR = rankBy(enriched, (c) => c.signals.trust);
  const valueR = rankBy(enriched, (c) => c.valueScore ?? 0);
  const resaleR = rankBy(enriched, (c) => c.signals.resale);
  const riskR = rankBy(enriched, (c) => c.riskScore ?? 50, true);
  const marketingR = rankBy(enriched, (c) => c.signals.marketing);
  const overallR = rankBy(enriched, (c) => weightedComposite(c, weights));

  const result: Record<string, DomainRankings> = {};
  for (const c of enriched) {
    result[c.domain] = {
      brand: brandR[c.domain],
      seo: seoR[c.domain],
      ai: aiR[c.domain],
      trust: trustR[c.domain],
      value: valueR[c.domain],
      resale: resaleR[c.domain],
      risk: riskR[c.domain],
      marketing: marketingR[c.domain],
      overall: overallR[c.domain],
    };
  }
  return result;
}

export function weightedComposite(c: DomainCandidate, weights: SignalWeights): number {
  return compositeScore(c, weights);
}

export function sortByWeights(
  candidates: DomainCandidate[],
  weights: SignalWeights
): DomainCandidate[] {
  return sortByOptimizeMode(candidates.map(enrichCandidate), "overall", weights);
}

export { sortByOptimizeMode };

function winner(
  id: string,
  label: string,
  candidate: DomainCandidate,
  score: number,
  reason: string
): SignalWinner {
  return { id, label, domain: candidate.domain, price: candidate.price, score, reason };
}

export function buildWinners(
  candidates: DomainCandidate[],
  weights: SignalWeights
): SignalWinner[] {
  const purchasable = candidates.filter((c) => isRecommendationEligible(c));
  const enriched = purchasable.map(enrichCandidate);
  if (enriched.length === 0) return [];

  const used = new Set<string>();

  function pickUnique(
    fn: (a: DomainCandidate, b: DomainCandidate) => number,
    getScore: (c: DomainCandidate) => number
  ): DomainCandidate {
    const sorted = [...enriched].sort(fn);
    for (const c of sorted) {
      if (!used.has(c.domain)) {
        used.add(c.domain);
        return c;
      }
    }
    return sorted[0];
  }

  const bestOverall = [...enriched].sort(
    (a, b) => compositeScore(b, weights) - compositeScore(a, weights)
  )[0];
  used.add(bestOverall.domain);

  const bestBrand = pickUnique((a, b) => b.signals.brand - a.signals.brand, (c) => c.signals.brand);
  const bestSeo = pickUnique((a, b) => b.signals.search - a.signals.search, (c) => c.signals.search);
  const bestAi = pickUnique((a, b) => b.signals.ai - a.signals.ai, (c) => c.signals.ai);
  const bestValue = pickUnique((a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0), (c) => c.valueScore ?? 0);
  const lowestRisk = pickUnique(
    (a, b) => (a.riskScore ?? 50) - (b.riskScore ?? 50),
    (c) => 100 - (c.riskScore ?? 0)
  );
  const bestResale = pickUnique((a, b) => b.signals.resale - a.signals.resale, (c) => c.signals.resale);

  return [
    winner("overall", "Best Overall", bestOverall, compositeScore(bestOverall, weights), bestOverall.analysis.recommendedAction),
    winner("brand", "Best Brand", bestBrand, bestBrand.signals.brand, bestBrand.analysis.signalEvidence?.brand ?? ""),
    winner("seo", "Best SEO Fit", bestSeo, bestSeo.signals.search, bestSeo.analysis.signalEvidence?.seo ?? ""),
    winner("ai", "Best AI Visibility", bestAi, bestAi.signals.ai, bestAi.analysis.signalEvidence?.ai ?? ""),
    winner("value", "Best Value", bestValue, bestValue.valueScore ?? 0, bestValue.analysis.signalEvidence?.value ?? ""),
    winner("risk", "Lowest Risk", lowestRisk, 100 - (lowestRisk.riskScore ?? 0), lowestRisk.analysis.signalEvidence?.risk ?? ""),
    winner("resale", "Best Resale", bestResale, bestResale.signals.resale, bestResale.analysis.signalEvidence?.resale ?? ""),
  ];
}

export function buildGraphPoints(candidates: DomainCandidate[]): DashboardView["graphPoints"] {
  const enriched = candidates.map(enrichCandidate);
  const maxPrice = Math.max(...enriched.map((c) => c.price), 1);

  const brandVsSeo: GraphPoint[] = enriched.map((c) => ({
    domain: c.domain,
    x: c.signals.brand,
    y: c.signals.search,
    price: c.price,
  }));

  const priceVsTrust: GraphPoint[] = enriched.map((c) => ({
    domain: c.domain,
    x: clamp((c.price / maxPrice) * 100),
    y: c.signals.trust,
    price: c.price,
  }));

  const aiVsAmbiguity: GraphPoint[] = enriched.map((c) => ({
    domain: c.domain,
    x: c.signals.ai,
    y: c.ambiguityRisk ?? computeAmbiguityRisk(c.signals),
    price: c.price,
  }));

  return { brandVsSeo, priceVsTrust, aiVsAmbiguity };
}

export function buildDashboardView(
  candidates: DomainCandidate[],
  weights: SignalWeights
): DashboardView {
  const enriched = candidates.map(enrichCandidate);
  const buyable = enriched.filter((c) => isRecommendationEligible(c));
  const rankings = buildRankings(buyable, weights);
  const winners = buildWinners(buyable, weights);
  const rankedResults = sortByWeights(buyable, weights);
  const graphPoints = buildGraphPoints(enriched);

  const benchmarkOnly = enriched
    .filter((c) => isBenchmarkOnly(c))
    .sort((a, b) => compositeScore(b, weights) - compositeScore(a, weights));
  const ideaOnly = enriched.filter(
    (c) => c.availabilityStatus === "idea_only" || c.availabilityStatus === "unknown" || c.availabilityStatus === "api_error"
  );

  return { candidates: [...buyable, ...benchmarkOnly, ...ideaOnly], rankings, winners, rankedResults, graphPoints };
}

export function getRankLabel(dimension: RankingDimension, rank: number, total: number): string {
  const prefix = rank === 1 ? "#1" : `#${rank}`;
  const labels: Record<RankingDimension, string> = {
    brand: "Brand Strength",
    seo: "SEO Fit",
    ai: "AI Clarity",
    trust: "Trust",
    value: "Price-to-Value",
    resale: "Resale Potential",
    risk: "Lowest Risk",
    marketing: "Marketing Clarity",
    overall: "Overall",
  };
  return `${prefix} ${labels[dimension]}${rank === total && total > 3 ? " (lowest)" : ""}`;
}

export function getTopRankChips(
  rankings: DomainRankings,
  total: number,
  candidate?: DomainCandidate,
  limit = 4
): Array<{ label: string; rank: number; dimension: RankingDimension }> {
  const dims: RankingDimension[] = ["seo", "ai", "value", "brand", "trust", "resale", "marketing"];
  const minScores: Partial<Record<RankingDimension, number>> = {
    seo: 68,
    ai: 65,
    brand: 68,
    trust: 80,
    value: 60,
    resale: 55,
    marketing: 65,
  };

  function signalFor(d: RankingDimension): number {
    if (!candidate) return 100;
    if (d === "value") return candidate.valueScore ?? 0;
    if (d === "risk") return 100 - (candidate.riskScore ?? 50);
    const key = d === "seo" ? "search" : d;
    return candidate.signals[key as keyof typeof candidate.signals] ?? 0;
  }

  return dims
    .map((d) => ({ dimension: d, rank: rankings[d], label: getRankLabel(d, rankings[d], total) }))
    .filter((d) => d.rank === 1 && signalFor(d.dimension) >= (minScores[d.dimension] ?? 60))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);
}

export function riskLabel(riskScore: number): "Low" | "Medium" | "High" {
  if (riskScore <= 30) return "Low";
  if (riskScore <= 50) return "Medium";
  return "High";
}
