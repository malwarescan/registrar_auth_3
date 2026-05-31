import type { DomainAnalysis, DomainCandidate, SignalScores, OptimizeMode, SignalWeights } from "@/lib/types/domain";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import { analyzeQueryMatch, getTldTrust, normalizeQueryTokens, parseDomain } from "./parse-domain";

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Unified signal model — all scores derive from the same query-match analysis:
 *
 * - coverage:   % of query tokens found in the domain label
 * - orderScore: tokens appear in query order (better for SEO exact-match)
 * - clarity:    brevity + word boundaries (hyphens help)
 *
 * Brand  = clarity-first (memorability), with moderate relevance boost
 * SEO    = coverage + order, penalized by length/redundancy
 * AI     = clarity + coverage balance (entities need parseable structure)
 * Marketing = average of brand + SEO
 * Trust  = TLD authority
 * Resale = TLD + length
 * Value  = weighted signal average minus price penalty
 * Overall = weighted composite of all above (see compositeScore)
 */
function computeSignals(
  parsed: ReturnType<typeof parseDomain>,
  queryTokens: string[]
): SignalScores {
  const match = analyzeQueryMatch(parsed.label, queryTokens);
  const penalty = match.redundancyPenalty + Math.max(0, parsed.length - 14) * 2;

  const brand = clamp(
    match.clarity * 0.65 +
      match.coverage * 0.2 +
      (parsed.hasHyphen ? 5 : 0) -
      penalty * 0.4
  );

  const search = clamp(
    match.coverage * 0.55 +
      match.orderScore * 0.25 +
      match.clarity * 0.15 +
      (parsed.tld === "com" ? 5 : parsed.tld === "net" ? 2 : 0) -
      penalty * 0.5
  );

  const ai = clamp(
    match.clarity * 0.45 +
      match.coverage * 0.35 +
      match.orderScore * 0.1 +
      (parsed.hasHyphen ? 8 : 0) -
      penalty * 0.35
  );

  const marketing = clamp((brand + search) / 2);
  const trust = clamp(getTldTrust(parsed.tld) - (parsed.hasHyphen ? 3 : 0));
  const resale = clamp(
    getTldTrust(parsed.tld) * 0.5 +
      (parsed.length <= 10 ? 15 : parsed.length <= 14 ? 5 : -5) +
      (parsed.tld === "com" ? 15 : 0)
  );

  return { brand, marketing, search, ai, trust, resale };
}

/** Weighted overall score — same formula used for ranking and "Best Overall" winner. */
export function compositeScore(c: DomainCandidate, weights: SignalWeights): number {
  const total =
    weights.brand + weights.seo + weights.ai + weights.value + weights.trust + weights.resale;
  if (total === 0) return 0;

  const value = c.valueScore ?? computeValueScore(c.signals, c.price);
  const riskPenalty = (c.riskScore ?? 0) * 0.08;

  const raw =
    c.signals.brand * weights.brand +
    c.signals.search * weights.seo +
    c.signals.ai * weights.ai +
    value * weights.value +
    c.signals.trust * weights.trust +
    c.signals.resale * weights.resale;

  return clamp(raw / total - riskPenalty);
}

function buildAnalysis(
  parsed: ReturnType<typeof parseDomain>,
  signals: SignalScores,
  query: string,
  match: ReturnType<typeof analyzeQueryMatch>
): DomainAnalysis {
  const strengths: string[] = [];
  const watchOuts: string[] = [];

  if (signals.search >= 75) {
    strengths.push(`Strong keyword coverage for "${query}" (${Math.round(match.coverage)}% token match).`);
  }
  if (signals.brand >= 70) {
    strengths.push("Short, memorable label with good verbal recall.");
  }
  if (signals.ai >= 75) {
    strengths.push("Parseable entity structure for AI/search indexing.");
  }
  if (parsed.hasHyphen) {
    strengths.push("Hyphens create clear word boundaries.");
  }
  if (strengths.length === 0) {
    strengths.push(`Moderate fit for "${query}" — review shorter variants.`);
  }

  if (match.coverage < 60) {
    watchOuts.push(`Only ${Math.round(match.coverage)}% of query keywords appear in this domain.`);
  }
  if (parsed.length > 14) {
    watchOuts.push(`Label is ${parsed.length} characters — long domains reduce recall.`);
  }
  if (match.redundancyPenalty > 0) {
    watchOuts.push("Redundant or repeated tokens in the label.");
  }
  if (signals.trust < 70) {
    watchOuts.push(`.${parsed.tld} TLD may reduce mainstream buyer trust.`);
  }
  if (watchOuts.length === 0) {
    watchOuts.push("Compare .com alternatives before committing.");
  }

  const idealFor = [`Businesses positioned around "${query}" with digital-first go-to-market.`];
  const notIdealFor = ["Generic directory sites or unrelated verticals."];

  let recommendedAction = `Balanced fit for "${query}" — compare top 3 by your priority (brand vs SEO).`;
  if (signals.brand >= signals.search + 10) {
    recommendedAction = "Strongest brand recall — best for long-term equity.";
  } else if (signals.search >= signals.brand + 10) {
    recommendedAction = "Strongest keyword match — best for search intent capture.";
  } else if (signals.search < 50) {
    recommendedAction = `Weak relevance to "${query}" — try shorter or exact-match variants.`;
  }

  return {
    strengths: strengths.slice(0, 3),
    watchOuts: watchOuts.slice(0, 2),
    idealFor,
    notIdealFor,
    recommendedAction,
  };
}

function buildBadges(signals: SignalScores, price: number, priceType: string): string[] {
  const badges: string[] = [];
  const valueScore = computeValueScore(signals, price);
  if (valueScore >= 75) badges.push("Strong Price-to-Value");
  if (signals.search >= 80) badges.push("Strong SEO fit");
  if (signals.brand >= 75) badges.push("Strong brand fit");
  if (signals.ai >= 75) badges.push("Strong AI clarity");
  if (priceType === "registration") badges.push("Available Now");
  return badges.slice(0, 3);
}

export function computeValueScore(signals: SignalScores, price: number): number {
  const avgSignal = (signals.brand + signals.search + signals.ai + signals.marketing) / 4;
  const pricePenalty = Math.min(price / 20, 25);
  return clamp(avgSignal - pricePenalty);
}

export function scoreDomain(
  domain: string,
  query: string,
  price: number,
  priceType: "registration" | "marketplace" = "marketplace",
  available = true
): DomainCandidate {
  const parsed = parseDomain(domain);
  const queryTokens = normalizeQueryTokens(query);
  const match = analyzeQueryMatch(parsed.label, queryTokens);
  const signals = computeSignals(parsed, queryTokens);
  const analysis = buildAnalysis(parsed, signals, query, match);
  const badges = buildBadges(signals, price, priceType);

  return {
    domain,
    price,
    priceType,
    available,
    signals,
    analysis,
    badges,
    valueScore: computeValueScore(signals, price),
  };
}

export function pickDecisionStack(candidates: DomainCandidate[]) {
  if (candidates.length === 0) throw new Error("No candidates to rank");
  const byBrand = [...candidates].sort((a, b) => b.signals.brand - a.signals.brand)[0];
  const bySeo = [...candidates].sort((a, b) => b.signals.search - a.signals.search)[0];
  const byAi = [...candidates].sort((a, b) => b.signals.ai - a.signals.ai)[0];
  return { brand: byBrand, seo: bySeo, ai: byAi };
}

export function sortByOptimizeMode(
  candidates: DomainCandidate[],
  mode: OptimizeMode,
  customWeights?: SignalWeights
): DomainCandidate[] {
  const weights = customWeights ?? OPTIMIZE_PRESETS[mode];
  return [...candidates].sort(
    (a, b) => compositeScore(b, weights) - compositeScore(a, weights)
  );
}
