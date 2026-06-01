import type { DomainBrief } from "@/lib/types/domain-brief";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import type { DomainCandidate, SignalWeights } from "@/lib/types/domain";
import { parseDomain } from "./parse-domain";
import { INTENT_WEIGHT_PRESETS } from "@/lib/search/brief-config";
import { canPurchaseDomain } from "@/lib/domains/availability";

function boost(weights: SignalWeights, key: keyof SignalWeights, amount: number): SignalWeights {
  return { ...weights, [key]: weights[key] + amount };
}

/** Derive signal weights from buying intent + brief context. */
export function deriveWeightsFromBrief(brief: DomainBrief): SignalWeights {
  const intent = resolveBuyingIntent(brief);
  let w = intent
    ? { ...INTENT_WEIGHT_PRESETS[intent], ...brief.priorityWeights }
    : { ...brief.priorityWeights };

  // Merge user slider adjustments on top of intent preset
  if (intent) {
    for (const key of Object.keys(brief.priorityWeights) as (keyof SignalWeights)[]) {
      if (brief.priorityWeights[key] !== 1) {
        w[key] = (INTENT_WEIGHT_PRESETS[intent][key] + brief.priorityWeights[key]) / 2;
      }
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

  if (brief.brandTones.some((t) => ["Premium", "Luxury", "Corporate", "Trustworthy"].includes(t))) {
    w = boost(w, "brand", 0.5);
    w = boost(w, "trust", 0.3);
  }
  if (brief.brandTones.includes("Local")) w = boost(w, "seo", 0.3);
  if (brief.resaleImportance) w = boost(w, "resale", 0.8);

  for (const req of brief.requirements) {
    if (req.includes("$500")) w = boost(w, "value", 0.6);
    if (req.includes("$2") || req.includes("$5") || req.includes("$10")) w = boost(w, "value", 0.3);
    if (req === "local SEO") w = boost(w, "seo", 0.4);
    if (req === "exact match") w = boost(w, "seo", 0.8);
    if (req === "brandable") w = boost(w, "brand", 0.6);
    if (req === "AI-visible") w = boost(w, "ai", 0.6);
  }

  return w;
}

/** Build the analysis query from brief fields (scoring context + NameSilo lookups). */
export function buildAnalysisQuery(brief: DomainBrief): string {
  const parts = [brief.naming.trim()];
  if (brief.productService.trim()) parts.push(brief.productService.trim());
  if (brief.industry.trim()) parts.push(brief.industry.trim());
  if (brief.location.trim()) parts.push(brief.location.trim());
  if (brief.audience.trim()) parts.push(`for ${brief.audience.trim()}`);
  if (brief.personalName.trim()) parts.unshift(brief.personalName.trim());
  if (brief.currentDomain.trim() && resolveBuyingIntent(brief) === "premium_upgrade") {
    parts.push(`upgrade from ${brief.currentDomain.trim()}`);
  }
  return parts.filter(Boolean).join(" ") || brief.naming.trim();
}

export function briefToFilters(brief: DomainBrief) {
  return {
    maxPrice: brief.maxPrice,
    ...(brief.tldPreference !== "any" ? { tld: `.${brief.tldPreference}` } : {}),
  };
}

/** Client-side filter based on requirement chips. */
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
  if (brief.buyNowOnly || brief.requirements.includes("buy now only")) {
    filtered = filtered.filter((c) => canPurchaseDomain(c));
  }
  if (!brief.premiumAllowed) {
    filtered = filtered.filter((c) => c.price <= brief.maxPrice);
  }

  return filtered.length > 0 ? filtered : candidates;
}
