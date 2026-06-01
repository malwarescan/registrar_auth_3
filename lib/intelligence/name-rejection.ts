import type { BuyingIntent } from "@/lib/types/domain-brief";

/** Human-readable rejection reason codes. */
export type RejectionReason =
  | "AWKWARD_ORDER"
  | "FULL_QUERY_JOIN"
  | "KEYWORD_STUFF"
  | "REPEATED_ROOT"
  | "REPEATED_CONCEPT"
  | "WEAK_SUFFIX_SPAM"
  | "GENERIC_FALLBACK"
  | "BARE_GEO"
  | "TOO_LONG"
  | "TOO_SHORT"
  | "HYPHEN_JUNK"
  | "STARTS_WITH_NUMBER"
  | "AWKWARD_KEYWORD_STUFFING"
  | "INVALID_CHAR"
  | "EMPTY_LABEL";

export type RejectionContext = {
  intent: BuyingIntent;
  allowHyphens: boolean;
  allowNumbers: boolean;
  maxLabelLength: number;
  preferBrandable: boolean;
  preferExactMatch: boolean;
  preferKeywordSlug: boolean;
  hasSubject: boolean;
  queryTokens: string[];
  locationKeywords: string[];
  service: string;
  allowSeoSlugs: boolean;
  minLabelLength?: number;
};

const GENERIC_BRAND_FALLBACK = ["Nova", "Prime", "Core", "Peak"];

const WEAK_SUFFIX_SPAM_EXACT = new Set([
  "proco",
  "cohub",
  "hubworks",
  "worksco",
  "worksworks",
  "cocraft",
  "workpro",
]);

const REPEATED_CONCEPT_PAIRS: [string, string][] = [
  ["security", "secure"],
  ["home", "house"],
  ["safe", "secure"],
  ["trust", "trusted"],
  ["guard", "guardian"],
];

export function splitLabelWords(label: string): string[] {
  return label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/-/g, "");
}

function isGenericFallbackLabel(label: string): boolean {
  const norm = label.toLowerCase();
  return GENERIC_BRAND_FALLBACK.some((g) => norm.startsWith(g.toLowerCase()));
}

function isWeakGenericBrand(label: string): boolean {
  const norm = normalizeLabel(label);
  return (
    /^(pro|co|hub|works|craft|house)(pro|co|hub|works|craft|house)/.test(norm) ||
    WEAK_SUFFIX_SPAM_EXACT.has(norm)
  );
}

function looksAwkwardKeywordStuffing(label: string): boolean {
  const words = splitLabelWords(label);
  if (words.length >= 4) return true;
  const normalized = normalizeLabel(label);
  if (/homeconstructionhome|constructionhomebuyer|buyershomeco|buyers-home/.test(normalized)) {
    return true;
  }
  if (/^(co|pro|hub|works|market)(co|pro|hub|works|market)/.test(normalized)) return true;
  const unique = new Set(words);
  return unique.size !== words.length && words.length >= 2;
}

function isFullQueryJoin(label: string, ctx: RejectionContext): boolean {
  if (ctx.allowSeoSlugs || ctx.intent === "seo_content") return false;
  if (!ctx.preferBrandable && ctx.intent !== "business_brand" && ctx.intent !== "saas_app") {
    return false;
  }
  const tokens = ctx.queryTokens.filter((t) => t.length > 2);
  if (tokens.length < 2) return false;
  const norm = normalizeLabel(label);
  const joined = tokens.join("");
  if (norm === joined) return true;
  if (joined.length > 5 && norm.includes(joined)) return true;
  return false;
}

function isAwkwardWordOrder(label: string, ctx: RejectionContext): boolean {
  const tokens = ctx.queryTokens.filter((t) => t.length > 2);
  if (tokens.length < 2) return false;
  const norm = normalizeLabel(label);
  const joined = tokens.join("");
  const reversed = [...tokens].reverse().join("");
  if (norm === reversed && norm !== joined) return true;
  if (/securitysystemhome|systemsecurityhome|companyhomesecurity/.test(norm)) return true;
  return false;
}

function hasKeywordStuffing(label: string, ctx: RejectionContext): boolean {
  const words = splitLabelWords(label);
  if (words.length >= 4) return true;
  const tokens = ctx.queryTokens.filter((t) => t.length > 2);
  if (tokens.length >= 3) {
    const norm = normalizeLabel(label);
    const matched = tokens.filter((t) => norm.includes(t));
    if (matched.length >= 3 && ctx.preferBrandable) return true;
  }
  return false;
}

function hasRepeatedRoot(label: string): boolean {
  const words = splitLabelWords(label);
  if (words.length < 2) return false;
  const seen = new Set<string>();
  for (const w of words) {
    if (seen.has(w)) return true;
    seen.add(w);
  }
  const norm = normalizeLabel(label);
  for (const w of words) {
    if (w.length >= 4 && norm.split(w).length > 2) return true;
  }
  return false;
}

function hasRepeatedConcept(label: string): boolean {
  const words = splitLabelWords(label);
  const wordSet = new Set(words);
  for (const [a, b] of REPEATED_CONCEPT_PAIRS) {
    if (wordSet.has(a) && wordSet.has(b)) return true;
  }
  return false;
}

function isBareGeo(label: string, ctx: RejectionContext): boolean {
  if (ctx.intent !== "local_service" && !ctx.locationKeywords.length) return false;
  const norm = normalizeLabel(label);
  if (!ctx.locationKeywords.length) return false;
  const hasLocation = ctx.locationKeywords.some((t) => norm.includes(t.replace(/-/g, "")));
  const hasService =
    Boolean(ctx.service && norm.includes(ctx.service.toLowerCase())) ||
    ctx.queryTokens.some((t) => t.length > 3 && norm.includes(t));
  return hasLocation && !hasService && norm.length <= 14;
}

function isBrandIntent(ctx: RejectionContext): boolean {
  return (
    ctx.intent === "business_brand" ||
    ctx.intent === "saas_app" ||
    ctx.intent === "ecommerce_store" ||
    ctx.intent === "campaign_landing"
  );
}

export function getRejectionReasons(label: string, ctx: RejectionContext): RejectionReason[] {
  const reasons: RejectionReason[] = [];
  const clean = label.replace(/[^a-zA-Z0-9-]/g, "");
  if (!clean.trim()) {
    reasons.push("EMPTY_LABEL");
    return reasons;
  }
  if (/^\d/.test(clean)) reasons.push("STARTS_WITH_NUMBER");

  const minLen = ctx.minLabelLength ?? 4;
  if (clean.length < minLen) reasons.push("TOO_SHORT");

  const maxLen =
    ctx.preferBrandable && isBrandIntent(ctx)
      ? Math.min(ctx.maxLabelLength, 14)
      : ctx.maxLabelLength;
  if (clean.length > maxLen) reasons.push("TOO_LONG");

  if (!ctx.allowHyphens && clean.includes("-")) reasons.push("HYPHEN_JUNK");
  if (!ctx.allowNumbers && /\d/.test(clean)) reasons.push("INVALID_CHAR");

  const words = splitLabelWords(clean);
  if (words.some((w) => w.length <= 1)) reasons.push("AWKWARD_KEYWORD_STUFFING");
  if (looksAwkwardKeywordStuffing(clean)) reasons.push("AWKWARD_KEYWORD_STUFFING");
  if (isWeakGenericBrand(clean)) reasons.push("WEAK_SUFFIX_SPAM");
  if (ctx.hasSubject && isGenericFallbackLabel(clean)) reasons.push("GENERIC_FALLBACK");
  if (hasRepeatedRoot(clean)) reasons.push("REPEATED_ROOT");
  if (hasRepeatedConcept(clean)) reasons.push("REPEATED_CONCEPT");
  if (isFullQueryJoin(clean, ctx)) reasons.push("FULL_QUERY_JOIN");
  if (isAwkwardWordOrder(clean, ctx)) reasons.push("AWKWARD_ORDER");
  if (hasKeywordStuffing(clean, ctx)) reasons.push("KEYWORD_STUFF");
  if (isBareGeo(clean, ctx)) reasons.push("BARE_GEO");

  if (ctx.preferBrandable && !ctx.allowSeoSlugs && clean.includes("-") && isBrandIntent(ctx)) {
    if (!reasons.includes("HYPHEN_JUNK")) reasons.push("HYPHEN_JUNK");
  }
  if (ctx.preferBrandable && words.length > 3 && isBrandIntent(ctx)) {
    reasons.push("KEYWORD_STUFF");
  }

  return [...new Set(reasons)];
}

export function rejectLabel(label: string, ctx: RejectionContext): RejectionReason | null {
  const reasons = getRejectionReasons(label, ctx);
  return reasons.length > 0 ? reasons[0] : null;
}

export function passesRejectionPipeline(label: string, ctx: RejectionContext): boolean {
  return getRejectionReasons(label, ctx).length === 0;
}

export function filterRejectedLabels(labels: string[], ctx: RejectionContext): string[] {
  return labels.filter((label) => passesRejectionPipeline(label, ctx));
}

export function buildRejectionContext(input: {
  intent: BuyingIntent;
  constraints: {
    allowHyphens: boolean;
    allowNumbers: boolean;
    maxLabelLength: number;
    preferBrandable: boolean;
    preferExactMatch: boolean;
    preferKeywordSlug: boolean;
  };
  hasSubject: boolean;
  queryTokens: string[];
  locationKeywords: string[];
  service: string;
}): RejectionContext {
  const { constraints } = input;
  return {
    intent: input.intent,
    allowHyphens: constraints.allowHyphens,
    allowNumbers: constraints.allowNumbers,
    maxLabelLength: constraints.maxLabelLength,
    preferBrandable: constraints.preferBrandable,
    preferExactMatch: constraints.preferExactMatch,
    preferKeywordSlug: constraints.preferKeywordSlug,
    hasSubject: input.hasSubject,
    queryTokens: input.queryTokens,
    locationKeywords: input.locationKeywords,
    service: input.service,
    allowSeoSlugs:
      constraints.preferExactMatch ||
      constraints.preferKeywordSlug ||
      input.intent === "seo_content",
  };
}
