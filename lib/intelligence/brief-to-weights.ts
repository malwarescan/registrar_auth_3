import type { DomainBrief } from "@/lib/types/domain-brief";
import type { DomainCandidate, SignalWeights } from "@/lib/types/domain";
import { parseDomain } from "./parse-domain";

function boost(weights: SignalWeights, key: keyof SignalWeights, amount: number): SignalWeights {
  return { ...weights, [key]: weights[key] + amount };
}

/** Derive signal weights from the full domain brief context. */
export function deriveWeightsFromBrief(brief: DomainBrief): SignalWeights {
  let w = { ...brief.priorityWeights };

  const goalBoosts: Record<string, Partial<SignalWeights>> = {
    start_business: { brand: 0.5, trust: 0.3, value: 0.2 },
    upgrade_domain: { brand: 0.8, trust: 0.5, seo: 0.3 },
    local_service: { trust: 1, seo: 0.8, brand: 0.3 },
    saas_startup: { brand: 1, ai: 0.8, trust: 0.4 },
    domain_investing: { resale: 1.5, value: 1, trust: 0.3 },
    seo_content: { seo: 1.5, ai: 0.5, brand: 0.2 },
  };
  if (brief.searchGoal && goalBoosts[brief.searchGoal]) {
    for (const [k, v] of Object.entries(goalBoosts[brief.searchGoal]!)) {
      w = boost(w, k as keyof SignalWeights, v!);
    }
  }

  if (brief.searchMode === "investor_research") w = boost(w, "resale", 1.2);
  if (brief.searchMode === "keyword") w = boost(w, "seo", 0.8);
  if (brief.searchMode === "current_domain") w = boost(w, "brand", 0.6);

  for (const ch of brief.marketingChannels) {
    if (ch === "Organic SEO" || ch === "Local SEO") w = boost(w, "seo", 0.4);
    if (ch === "Paid ads") w = boost(w, "trust", 0.3);
    if (ch === "Investor presentation") w = boost(w, "brand", 0.5);
    if (ch === "Resale/flipping") w = boost(w, "resale", 0.8);
  }

  for (const g of brief.seoGoals) {
    if (g.includes("Exact-match") || g.includes("Category keyword")) w = boost(w, "seo", 0.5);
    if (g.includes("memorable brand")) w = boost(w, "brand", 0.4);
  }

  for (const g of brief.aiGoals) {
    w = boost(w, "ai", 0.4);
  }

  for (const t of brief.trustRequirements) {
    if (t.includes(".com") || t.includes("spell") || t.includes("phone")) w = boost(w, "trust", 0.3);
  }

  if (brief.brandTones.some((t) => ["Premium", "Luxury", "Corporate"].includes(t))) {
    w = boost(w, "brand", 0.5);
    w = boost(w, "trust", 0.3);
  }
  if (brief.brandTones.includes("Local")) w = boost(w, "seo", 0.3);
  if (brief.resaleImportance) w = boost(w, "resale", 0.8);

  for (const req of brief.requirements) {
    if (req.includes("$500")) w = boost(w, "value", 0.6);
    if (req.includes("$2") || req.includes("$5")) w = boost(w, "value", 0.3);
    if (req === "local SEO") w = boost(w, "seo", 0.4);
    if (req === "exact match") w = boost(w, "seo", 0.5);
    if (req === "brandable") w = boost(w, "brand", 0.5);
  }

  return w;
}

/** Build the analysis query from brief fields. */
export function buildAnalysisQuery(brief: DomainBrief): string {
  const parts = [brief.naming.trim()];
  if (brief.productService.trim()) parts.push(brief.productService.trim());
  if (brief.industry.trim()) parts.push(brief.industry.trim());
  if (brief.location.trim()) parts.push(brief.location.trim());
  if (brief.audience.trim()) parts.push(`for ${brief.audience.trim()}`);
  if (brief.currentDomain.trim() && brief.searchMode === "current_domain") {
    parts.push(`better domain than ${brief.currentDomain.trim()}`);
  }
  return parts.filter(Boolean).join(" ") || brief.naming.trim();
}

export function briefToFilters(brief: DomainBrief) {
  return {
    maxPrice: brief.maxPrice,
    ...(brief.tldPreference !== "any" ? { tld: `.${brief.tldPreference}` } : {}),
  };
}

/** Client-side filter/boost based on requirement chips. */
export function applyBriefRequirements(
  candidates: DomainCandidate[],
  brief: DomainBrief
): DomainCandidate[] {
  let filtered = [...candidates];

  if (brief.requirements.includes("no hyphens")) {
    filtered = filtered.filter((c) => !parseDomain(c.domain).hasHyphen);
  }
  if (brief.requirements.includes("no numbers")) {
    filtered = filtered.filter((c) => !/\d/.test(parseDomain(c.domain).label));
  }
  if (brief.requirements.includes(".com preferred")) {
    const com = filtered.filter((c) => parseDomain(c.domain).tld === "com");
    if (com.length > 0) filtered = com;
  }
  if (brief.requirements.includes("easy to say")) {
    filtered = filtered.filter((c) => parseDomain(c.domain).length <= 14);
  }
  if (brief.buyNowOnly) {
    filtered = filtered.filter((c) => c.available);
  }
  if (!brief.premiumAllowed) {
    filtered = filtered.filter((c) => c.price <= brief.maxPrice);
  }

  return filtered.length > 0 ? filtered : candidates;
}
