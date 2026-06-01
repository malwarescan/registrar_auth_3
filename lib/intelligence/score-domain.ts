import type { DomainAnalysis, DomainCandidate, SignalScores, OptimizeMode, SignalWeights, AvailabilityStatus } from "@/lib/types/domain";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import type { BuyingIntent } from "@/lib/types/domain-brief";
import { analyzeQueryMatch, getTldTrust, analyzeQueryContext, parseDomain, getMeaningfulScoringTokens } from "./parse-domain";

export type ScoringContext = {
  intent?: BuyingIntent | null;
  brandablePreferred?: boolean;
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function isBrandableLabel(label: string): boolean {
  const normalized = label.replace(/-/g, "");
  // Two-word compound without being a long keyword join
  const hasCompound = /[a-z][A-Z]/.test(label) || (normalized.length >= 6 && normalized.length <= 14);
  const notLongJoin = normalized.length <= 16;
  return hasCompound && notLongJoin;
}

function isLocalKeywordSlug(labelNorm: string, service: string, city: string): boolean {
  if (!service || !city) return false;
  return labelNorm === service + city || labelNorm === city + service;
}

function isBusinessStyleLocalLabel(label: string): boolean {
  return (
    /[a-z][A-Z].*[A-Z]/.test(label) ||
    /(co|pros|group|team|hq|slice|pie|oven|works|house)$/i.test(label.replace(/-/g, ""))
  );
}

function computeSignals(
  parsed: ReturnType<typeof parseDomain>,
  queryTokens: string[],
  query: string,
  ctx?: ScoringContext
): SignalScores {
  const context = analyzeQueryContext(query);
  const meaningfulTokens = getMeaningfulScoringTokens(context);
  const match = analyzeQueryMatch(parsed.label, meaningfulTokens.length ? meaningfulTokens : queryTokens, context);
  let penalty =
    match.redundancyPenalty + match.localPenalty + Math.max(0, parsed.length - 14) * 2;

  const brandablePreferred =
    ctx?.brandablePreferred ??
    (ctx?.intent === "business_brand" ||
      ctx?.intent === "saas_app" ||
      ctx?.intent === "ecommerce_store");
  const literalJoin = queryTokens.join("").toLowerCase();
  const labelNorm = parsed.label.replace(/-/g, "").toLowerCase();

  let brandBonus = 0;
  let seoPenalty = 0;

  if (brandablePreferred) {
    if (isBrandableLabel(parsed.label)) brandBonus += 18;
    if (literalJoin.length > 5 && labelNorm.includes(literalJoin)) seoPenalty += 25;
    if (match.coverage > 85 && labelNorm === literalJoin) seoPenalty += 20;
    if (parsed.hasHyphen && match.coverage > 70) seoPenalty += 8;
  } else if (ctx?.intent === "seo_content") {
    if (match.coverage >= 70) brandBonus += 10;
  }

  if (ctx?.intent === "local_service" && context.businessTokens.length > 0) {
    const primaryService =
      context.businessTokens.find((t) => !["parlour", "parlor", "restaurant"].includes(t)) ??
      context.businessTokens[0];
    const city = context.locationTokens.find((t) => t.length > 2) ?? context.locationTokens[0] ?? "";
    const hasBusiness = meaningfulTokens.some((t) => labelNorm.includes(t)) || labelNorm.includes(primaryService);
    const hasLocation = context.locationTokens.some((t) => labelNorm.includes(t.replace(/-/g, "")));
    const isBareGeo = context.locationTokens.some((t) => labelNorm === t.replace(/-/g, ""));
    const isRawSlug = isLocalKeywordSlug(labelNorm, primaryService, city);

    if (isBareGeo && !hasBusiness) {
      penalty += 50;
      seoPenalty += 30;
    } else if (isBusinessStyleLocalLabel(parsed.label) && hasLocation) {
      brandBonus += 25;
      seoPenalty -= 5;
    } else if (hasBusiness && hasLocation && !isRawSlug) {
      brandBonus += 22;
    } else if (hasBusiness && hasLocation) {
      brandBonus += 8;
      seoPenalty += 12;
      penalty += 8;
    } else if (hasBusiness) {
      brandBonus += 8;
    } else if (isRawSlug) {
      brandBonus -= 15;
      seoPenalty += 5;
      penalty += 10;
    }
  }

  const brand = clamp(
    match.clarity * 0.55 +
      match.coverage * 0.1 +
      match.locationCoverage * 0.15 +
      brandBonus +
      (parsed.hasHyphen && !brandablePreferred ? 5 : 0) -
      penalty * 0.4
  );

  const search = clamp(
    match.coverage * 0.4 +
      match.locationCoverage * 0.25 +
      match.orderScore * 0.2 +
      match.clarity * 0.1 +
      (parsed.tld === "com" ? 5 : parsed.tld === "net" ? 2 : 0) -
      penalty * 0.5 -
      seoPenalty
  );

  const ai = clamp(
    match.clarity * 0.4 +
      match.coverage * 0.25 +
      match.locationCoverage * 0.2 +
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
  match: ReturnType<typeof analyzeQueryMatch>,
  context: ReturnType<typeof analyzeQueryContext>,
  intent?: BuyingIntent | null
): DomainAnalysis {
  const strengths: string[] = [];
  const watchOuts: string[] = [];
  const meaningfulTokens = getMeaningfulScoringTokens(context);
  const labelNorm = parsed.label.toLowerCase().replace(/-/g, "");
  const primaryService = meaningfulTokens[0] ?? "";
  const primaryCity = meaningfulTokens.find((t) => context.locationTokens.includes(t)) ?? "";
  const hasCoreLocalFit =
    intent === "local_service" &&
    primaryService &&
    primaryCity &&
    labelNorm.includes(primaryService) &&
    labelNorm.includes(primaryCity);

  if (hasCoreLocalFit) {
    strengths.push(`Clear ${primaryService} + ${primaryCity} fit for a local business customers can remember.`);
  } else if (signals.search >= 75) {
    strengths.push(`Strong keyword coverage for "${query}" (${Math.round(match.coverage)}% token match).`);
  }
  if (context.isLocalIntent && match.locationCoverage >= 80) {
    strengths.push(`Includes local place (${context.locationTokens.join(", ")}) for local search fit.`);
  }
  if (context.isLocalIntent && match.locationCoverage < 50) {
    watchOuts.push(
      `No location (${context.locationTokens.join(", ")}) in the name — weaker for local search.`
    );
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

  if (match.coverage < 60 && !hasCoreLocalFit) {
    watchOuts.push(`Only ${Math.round(match.coverage)}% of query keywords appear in this domain.`);
  }
  if (
    intent === "local_service" &&
    isLocalKeywordSlug(labelNorm, primaryService, primaryCity) &&
    !isBusinessStyleLocalLabel(parsed.label)
  ) {
    watchOuts.push("Reads like an SEO keyword slug — weaker as a storefront brand customers trust.");
  }
  if (context.isLocalIntent && match.locationCoverage < 50) {
    watchOuts.push(
      `No local place name (${context.locationTokens.join(", ")}) — weak fit for a location-based business.`
    );
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

function buildBadges(
  signals: SignalScores,
  price: number,
  status: AvailabilityStatus
): string[] {
  const badges: string[] = [];
  const valueScore = computeValueScore(signals, price);
  if (status === "available") badges.push("Available now");
  else if (status === "premium_available") badges.push("Premium listing");
  else if (status === "marketplace_available") badges.push("Marketplace listing");
  else if (status === "taken") badges.push("Taken");
  else if (status === "benchmark_only") badges.push("Benchmark only");
  else if (status === "idea_only") badges.push("Availability not checked");
  else if (status === "unknown") badges.push("Availability unknown");
  else badges.push("Availability check failed");
  if (valueScore >= 75) badges.push("Strong Price-to-Value");
  if (signals.search >= 80) badges.push("Strong SEO fit");
  if (signals.brand >= 75) badges.push("Strong brand fit");
  if (signals.ai >= 75) badges.push("Strong AI clarity");
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
  available = true,
  scoringContext?: ScoringContext
): DomainCandidate {
  const parsed = parseDomain(domain);
  const context = analyzeQueryContext(query);
  const queryTokens = [...context.businessTokens, ...context.locationTokens];
  const meaningfulTokens = getMeaningfulScoringTokens(context);
  const match = analyzeQueryMatch(
    parsed.label,
    meaningfulTokens.length ? meaningfulTokens : queryTokens,
    context
  );
  const signals = computeSignals(parsed, meaningfulTokens.length ? meaningfulTokens : queryTokens, query, scoringContext);
  const analysis = buildAnalysis(parsed, signals, query, match, context, scoringContext?.intent);
  const status: AvailabilityStatus =
    priceType === "marketplace" && available
      ? "marketplace_available"
      : available
        ? "available"
        : "taken";
  const badges = buildBadges(signals, price, status);

  return {
    domain,
    price,
    priceType,
    available,
    availabilityStatus: status,
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
