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
  let text = query.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  for (const [pattern, abbrev] of LOCATION_PHRASES) {
    text = text.replace(pattern, ` ${abbrev} `);
  }
  const tokens = text
    .split(/[\s,_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  // Deduplicate while preserving order
  return [...new Set(tokens)];
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
};

/** How well a domain label matches query tokens (0–100 each dimension). */
export function analyzeQueryMatch(label: string, queryTokens: string[]): QueryMatch {
  if (queryTokens.length === 0) {
    return { coverage: 50, orderScore: 50, clarity: 50, redundancyPenalty: 0 };
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

  // Clarity: shorter is clearer; hyphens add word boundaries
  let clarity = 100;
  if (label.length > 12) clarity -= (label.length - 12) * 4;
  if (label.length > 18) clarity -= (label.length - 18) * 6;
  if (label.includes("-")) clarity += 8;
  clarity = Math.max(0, Math.min(100, clarity));

  // Penalize repeated geo tokens (e.g. "la" appearing twice in label)
  let redundancyPenalty = 0;
  for (const token of queryTokens) {
    if (token.length <= 3) {
      const occurrences = normalized.split(token).length - 1;
      if (occurrences > 1) redundancyPenalty += 15 * (occurrences - 1);
    }
  }

  return { coverage, orderScore, clarity, redundancyPenalty };
}

export function buildLabelVariants(tokens: string[]): string[] {
  if (tokens.length === 0) return [];

  const labels = new Set<string>();
  const joined = tokens.join("");
  const hyphenated = tokens.join("-");

  labels.add(joined);
  if (hyphenated !== joined) labels.add(hyphenated);

  if (tokens.length === 2) {
    labels.add(tokens[0] + tokens[1]);
    labels.add(tokens[1] + tokens[0]);
    labels.add(`${tokens[0]}-${tokens[1]}`);
  }

  if (tokens.length >= 3) {
    const last = tokens[tokens.length - 1];
    const core = tokens.slice(0, -1);
    const coreJoined = core.join("");
    const coreHyphen = core.join("-");

    if (last.length <= 3) {
      // Location-suffixed and prefixed variants
      labels.add(coreJoined + last);
      labels.add(last + coreJoined);
      labels.add(`${coreHyphen}-${last}`);
      labels.add(`${last}-${coreHyphen}`);
      // Brand-friendlier: drop geo suffix
      labels.add(coreJoined);
      labels.add(coreHyphen);
    } else {
      labels.add(tokens.slice(0, 2).join(""));
      labels.add(`${tokens[0]}-${tokens[1]}`);
    }
  }

  return [...labels]
    .filter((l) => l.length >= 4 && l.length <= 18)
    .sort((a, b) => a.length - b.length);
}

const DEFAULT_TLDS = ["com", "net", "co", "io"];

export function generateDomainNames(query: string, tldFilter?: string): string[] {
  const tokens = normalizeQueryTokens(query);
  if (tokens.length === 0) return [];

  const labels = buildLabelVariants(tokens);
  const tlds = tldFilter
    ? [tldFilter.replace(/^\./, "").toLowerCase()]
    : DEFAULT_TLDS;

  const domains = new Set<string>();
  for (const label of labels) {
    for (const tld of tlds) {
      domains.add(`${label}.${tld}`);
    }
  }

  return [...domains].slice(0, 30);
}
