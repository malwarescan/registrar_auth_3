import { analyzeQueryContext, labelIncludesLocation, type QueryContext } from "./query-context";

const STOP_WORDS = new Set([
  "in", "the", "a", "an", "for", "and", "or", "of", "to", "at", "on", "with", "by",
]);

const LOCATION_PHRASES: Array<[RegExp, string]> = [
  [/los\s+angeles/g, "la"],
  [/new\s+york/g, "ny"],
  [/san\s+francisco/g, "sf"],
  [/san\s+diego/g, "sd"],
];

export type ParsedDomain = {
  label: string;
  tld: string;
  full: string;
  words: string[];
  length: number;
  hasHyphen: boolean;
};

const TLD_TRUST: Record<string, number> = {
  com: 100,
  net: 85,
  org: 80,
  io: 75,
  co: 70,
  tech: 55,
  app: 65,
  dev: 60,
};

export function parseDomain(domain: string): ParsedDomain {
  const normalized = domain.toLowerCase().trim();
  const dotIndex = normalized.lastIndexOf(".");
  const label = dotIndex > 0 ? normalized.slice(0, dotIndex) : normalized;
  const tld = dotIndex > 0 ? normalized.slice(dotIndex + 1) : "com";

  const words = label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[-_.]+/)
    .filter(Boolean);

  return {
    label,
    tld,
    full: normalized,
    words,
    length: label.length,
    hasHyphen: label.includes("-"),
  };
}

export function getTldTrust(tld: string): number {
  return TLD_TRUST[tld.toLowerCase()] ?? 45;
}

/** Normalize location phrases, then tokenize (stop words removed). */
export function normalizeQueryTokens(query: string): string[] {
  const ctx = analyzeQueryContext(query);
  return [...ctx.businessTokens, ...ctx.locationTokens];
}

/** @deprecated use normalizeQueryTokens */
export function tokenizeQuery(query: string): string[] {
  return normalizeQueryTokens(query);
}

/** @deprecated use normalizeQueryTokens */
export function expandQueryTokens(query: string): string[] {
  return normalizeQueryTokens(query);
}

export type QueryMatch = {
  coverage: number;
  orderScore: number;
  clarity: number;
  redundancyPenalty: number;
  locationCoverage: number;
  localPenalty: number;
};

/** How well a domain label matches query tokens (0–100 each dimension). */
export function analyzeQueryMatch(
  label: string,
  queryTokens: string[],
  context?: QueryContext
): QueryMatch {
  if (queryTokens.length === 0) {
    return {
      coverage: 50,
      orderScore: 50,
      clarity: 50,
      redundancyPenalty: 0,
      locationCoverage: 50,
      localPenalty: 0,
    };
  }

  const normalized = label.toLowerCase().replace(/-/g, "");
  let matched = 0;
  let searchFrom = 0;
  let orderHits = 0;

  for (const token of queryTokens) {
    const idx = normalized.indexOf(token, searchFrom);
    if (idx >= 0) {
      matched++;
      if (idx <= searchFrom + 2) orderHits++;
      searchFrom = idx + token.length;
    } else if (normalized.includes(token)) {
      matched++;
    }
  }

  const coverage = (matched / queryTokens.length) * 100;
  const orderScore = (orderHits / queryTokens.length) * 100;

  let clarity = 100;
  if (label.length > 12) clarity -= (label.length - 12) * 4;
  if (label.length > 18) clarity -= (label.length - 18) * 6;
  if (label.includes("-")) clarity += 8;
  clarity = Math.max(0, Math.min(100, clarity));

  let redundancyPenalty = 0;
  for (const token of queryTokens) {
    if (token.length <= 3) {
      const occurrences = normalized.split(token).length - 1;
      if (occurrences > 1) redundancyPenalty += 15 * (occurrences - 1);
    }
  }

  let locationCoverage = 50;
  let localPenalty = 0;
  if (context?.locationTokens.length) {
    const locMatched = context.locationTokens.filter((t) =>
      normalized.includes(t.replace(/-/g, ""))
    ).length;
    locationCoverage = (locMatched / context.locationTokens.length) * 100;

    if (context.isLocalIntent && locMatched === 0) {
      localPenalty = 35;
    } else if (context.isLocalIntent && locMatched > 0) {
      locationCoverage = Math.min(100, locationCoverage + 10);
    }
  }

  return { coverage, orderScore, clarity, redundancyPenalty, locationCoverage, localPenalty };
}

function addLabel(labels: Set<string>, label: string) {
  if (label.length >= 4 && label.length <= 22) labels.add(label);
}

export function buildLabelVariants(tokens: string[], context?: QueryContext): string[] {
  if (tokens.length === 0 && !context) return [];

  const labels = new Set<string>();
  const business = context?.businessTokens.length ? context.businessTokens : tokens;
  const locations = context?.locationTokens ?? [];

  const joined = business.join("");
  const hyphenated = business.join("-");
  addLabel(labels, joined);
  // Local businesses: skip generic hyphenated joins (e.g. artisan-pasta) — prefer location combos
  if (hyphenated !== joined && !context?.isLocalIntent) {
    addLabel(labels, hyphenated);
  }

  if (business.length === 2) {
    addLabel(labels, business[0] + business[1]);
    addLabel(labels, business[1] + business[0]);
    addLabel(labels, `${business[0]}-${business[1]}`);
  }

  // Local business: prioritize location + service combinations
  if (locations.length > 0 && business.length > 0) {
    const loc = locations.join("");
    const biz = business.join("");
    const bizHyphen = business.join("-");
    const locHyphen = locations.join("-");

    addLabel(labels, biz + loc);
    addLabel(labels, loc + biz);
    addLabel(labels, `${bizHyphen}-${locHyphen}`);
    addLabel(labels, `${locHyphen}-${bizHyphen}`);

    if (business.length >= 2) {
      const [a, b] = business;
      addLabel(labels, a + b + loc);
      addLabel(labels, b + loc);
      addLabel(labels, loc + a + b);
      addLabel(labels, `${a}${b}${loc}`);
      addLabel(labels, `${b}-${loc}`);
      addLabel(labels, `${loc}-${b}`);
    }

    // Shorter local variants (drop one business token if 3+)
    if (business.length >= 2) {
      addLabel(labels, business[0] + loc);
      addLabel(labels, business[1] + loc);
      addLabel(labels, loc + business[0]);
    }
  } else if (business.length >= 3) {
    const last = business[business.length - 1];
    const core = business.slice(0, -1);
    const coreJoined = core.join("");
    const coreHyphen = core.join("-");

    if (last.length <= 3) {
      addLabel(labels, coreJoined + last);
      addLabel(labels, last + coreJoined);
      addLabel(labels, `${coreHyphen}-${last}`);
      addLabel(labels, coreJoined);
      addLabel(labels, coreHyphen);
    } else {
      addLabel(labels, business.slice(0, 2).join(""));
      addLabel(labels, `${business[0]}-${business[1]}`);
    }
  }

  return [...labels].sort((a, b) => a.length - b.length);
}

const DEFAULT_TLDS = ["com", "net", "co", "io"];

export function generateDomainNames(query: string, tldFilter?: string): string[] {
  const context = analyzeQueryContext(query);
  const tokens = [...context.businessTokens, ...context.locationTokens];
  if (tokens.length === 0) return [];

  const labels = buildLabelVariants(tokens, context);
  const tlds = tldFilter
    ? [tldFilter.replace(/^\./, "").toLowerCase()]
    : DEFAULT_TLDS;

  const domains = new Set<string>();
  for (const label of labels) {
    for (const tld of tlds) {
      domains.add(`${label}.${tld}`);
    }
  }

  // Sort: local domains with location first when local intent
  const list = [...domains];
  if (context.isLocalIntent) {
    list.sort((a, b) => {
      const aHas = labelIncludesLocation(parseDomain(a).label, context.locationTokens) ? 0 : 1;
      const bHas = labelIncludesLocation(parseDomain(b).label, context.locationTokens) ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      return a.length - b.length;
    });
  }

  return list.slice(0, 36);
}

export { analyzeQueryContext, labelIncludesLocation, getMeaningfulScoringTokens } from "./query-context";
