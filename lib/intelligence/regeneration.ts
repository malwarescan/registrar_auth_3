import type { DomainCandidate } from "@/lib/types/domain";
import type { NamingCriteria } from "@/lib/intelligence/naming-criteria";
import type { LabeledCandidate, NamingLane } from "@/lib/types/naming";
import {
  buildRejectionContext,
  passesRejectionPipeline,
  splitLabelWords,
} from "@/lib/intelligence/name-rejection";
import {
  expandVocabulary,
  extractConcepts,
  ROLE_BUCKETS,
} from "@/lib/intelligence/semantic-expansion";
import { canPurchaseDomain, isBenchmarkOnly } from "@/lib/domains/availability";
import { parseDomain } from "@/lib/intelligence/parse-domain";
import type { BriefQuality, QueryLiteralness } from "@/lib/intelligence/query-literalness";

export const MAX_REGENERATION_CHECKS = 40;
export const MAX_REGENERATION_SEEDS = 3;
export const MIN_BUYABLE_THRESHOLD = 3;

const BRANDABLE_LANES: NamingLane[] = [
  "premium_brandable",
  "service_clear",
  "saas_app",
  "short_punchy",
];

const ADJACENT_LANES: Partial<Record<NamingLane, NamingLane[]>> = {
  premium_brandable: ["service_clear", "saas_app"],
  service_clear: ["premium_brandable", "saas_app"],
  saas_app: ["premium_brandable", "service_clear"],
  short_punchy: ["premium_brandable"],
};

export type RegenerationSeed = {
  domain: string;
  label: string;
  namingLane?: NamingLane;
  brandScore: number;
  roots?: string[];
};

export type GenerationMeta = {
  pass1Checked: number;
  pass2Checked: number;
  buyableCountBeforeRegeneration: number;
  buyableCountAfterRegeneration: number;
  regenerationTriggered: boolean;
  regenerationSeeds: string[];
  generationPassesUsed: number;
  lanesExpanded: NamingLane[];
  queryLiteralness: QueryLiteralness;
  briefQuality: BriefQuality;
  literalRootUsed: boolean;
  literalRoot: string | null;
  missingContextWarning?: string | null;
};

export type RegenerationTriggerInput = {
  candidates: DomainCandidate[];
  criteria: NamingCriteria;
};

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function rejectionContext(criteria: NamingCriteria) {
  const tokens = [
    ...criteria.description.toLowerCase().split(/[\s,_-]+/),
    ...criteria.serviceKeywords,
  ].filter((t) => t.length > 2);

  return buildRejectionContext({
    intent: criteria.intent,
    constraints: criteria.constraints,
    hasSubject: criteria.hasSubject,
    queryTokens: tokens,
    locationKeywords: criteria.locationKeywords,
    service: criteria.service,
  });
}

function findBucketForToken(token: string): keyof typeof ROLE_BUCKETS | null {
  const norm = token.toLowerCase();
  for (const [role, words] of Object.entries(ROLE_BUCKETS)) {
    if (words.some((w) => w.toLowerCase() === norm)) {
      return role as keyof typeof ROLE_BUCKETS;
    }
  }
  return null;
}

function synonymTokens(token: string, max = 6): string[] {
  const bucket = findBucketForToken(token);
  if (!bucket) return [];
  return ROLE_BUCKETS[bucket]
    .filter((w) => w.toLowerCase() !== token.toLowerCase())
    .slice(0, max);
}

function isTakenOrBenchmark(candidate: DomainCandidate): boolean {
  return (
    candidate.availabilityStatus === "taken" ||
    candidate.availabilityStatus === "benchmark_only"
  );
}

function isWeakKeywordBuyable(candidate: DomainCandidate): boolean {
  return (
    canPurchaseDomain(candidate) &&
    candidate.signals.search >= 70 &&
    candidate.signals.brand < 55
  );
}

function labelPassesForRegeneration(label: string, criteria: NamingCriteria): boolean {
  return passesRejectionPipeline(label, rejectionContext(criteria));
}

/** Pick taken high-signal domains as regeneration seeds (never buyable). */
export function selectRegenerationSeeds(
  candidates: DomainCandidate[],
  criteria: NamingCriteria,
  maxSeeds = MAX_REGENERATION_SEEDS
): RegenerationSeed[] {
  const ctx = rejectionContext(criteria);

  const pool = candidates
    .filter((c) => isTakenOrBenchmark(c))
    .filter((c) => c.signals.brand >= 55 || c.signals.marketing >= 60)
    .filter((c) => {
      const label = parseDomain(c.domain).label;
      return passesRejectionPipeline(label, ctx);
    })
    .sort((a, b) => b.signals.brand - a.signals.brand);

  const seeds: RegenerationSeed[] = [];
  const seenLabels = new Set<string>();

  for (const c of pool) {
    if (seeds.length >= maxSeeds) break;
    const label = parseDomain(c.domain).label;
    const key = label.toLowerCase();
    if (seenLabels.has(key)) continue;
    seenLabels.add(key);

    const words = splitLabelWords(label);
    seeds.push({
      domain: c.domain,
      label,
      namingLane: c.namingLane,
      brandScore: c.signals.brand,
      roots: words.length >= 2 ? words : undefined,
    });
  }

  return seeds;
}

/** Generate neighbor labels from a taken benchmark seed using semantic role swaps. */
export function generateNeighbors(
  seed: RegenerationSeed,
  criteria: NamingCriteria
): LabeledCandidate[] {
  const seedLabelNorm = seed.label.toLowerCase();
  const primaryLane = seed.namingLane ?? "premium_brandable";
  const lanes: NamingLane[] = [
    primaryLane,
    ...(ADJACENT_LANES[primaryLane] ?? []),
  ];

  const corpus = [criteria.description, criteria.industry, criteria.service]
    .filter(Boolean)
    .join(" ");
  const vocab = expandVocabulary(extractConcepts(corpus));

  const results: LabeledCandidate[] = [];
  const seen = new Set<string>([seedLabelNorm]);

  const add = (label: string, lane: NamingLane, roots?: string[]) => {
    const key = label.toLowerCase();
    if (seen.has(key) || key === seedLabelNorm) return;
    if (!labelPassesForRegeneration(label, criteria)) return;
    seen.add(key);
    results.push({
      label,
      lane,
      roots,
      generationPass: 2,
      seedDomain: seed.domain,
    });
  };

  const words = splitLabelWords(seed.label);

  if (words.length >= 2) {
    const swapped = capitalize(words[1]) + capitalize(words[0]);
    add(swapped, primaryLane, [words[1], words[0]]);

    for (const syn0 of synonymTokens(words[0], 5)) {
      add(capitalize(syn0) + capitalize(words[1]), primaryLane, [syn0, words[1]]);
    }
    for (const syn1 of synonymTokens(words[1], 5)) {
      add(capitalize(words[0]) + capitalize(syn1), primaryLane, [words[0], syn1]);
    }
    for (const syn0 of synonymTokens(words[0], 4)) {
      for (const syn1 of synonymTokens(words[1], 4)) {
        add(capitalize(syn0) + capitalize(syn1), primaryLane, [syn0, syn1]);
      }
    }
  }

  for (const left of vocab.protection.slice(0, 6)) {
    for (const right of vocab.place.slice(0, 6)) {
      add(capitalize(left) + capitalize(right), "premium_brandable", [left, right]);
      add(capitalize(right) + capitalize(left), "service_clear", [right, left]);
    }
  }

  for (const left of vocab.trust.slice(0, 4)) {
    for (const right of vocab.place.slice(0, 4)) {
      add(capitalize(left) + capitalize(right), "premium_brandable", [left, right]);
    }
  }

  for (const alert of vocab.alert.slice(0, 4)) {
    for (const tech of vocab.tech.slice(0, 4)) {
      add(capitalize(alert) + capitalize(tech), "saas_app", [alert, tech]);
    }
    for (const place of vocab.place.slice(0, 3)) {
      add(capitalize(alert) + capitalize(place), "service_clear", [alert, place]);
    }
  }

  for (const prot of vocab.protection.slice(0, 4)) {
    for (const tech of vocab.tech.slice(0, 4)) {
      add(capitalize(prot) + capitalize(tech), "saas_app", [prot, tech]);
    }
  }

  if (criteria.service) {
    const serviceCap = capitalize(criteria.service);
    for (const prot of vocab.protection.slice(0, 5)) {
      add(serviceCap + prot, "service_clear", [serviceCap, prot]);
    }
  }

  const allowedLanes = new Set<NamingLane>(lanes);
  return results.filter((c) => allowedLanes.has(c.lane));
}

/** Regenerate labeled candidates from multiple benchmark seeds. */
export function regenerateFromBenchmark(
  seeds: RegenerationSeed[],
  criteria: NamingCriteria
): LabeledCandidate[] {
  const byLabel = new Map<string, LabeledCandidate>();

  for (const seed of seeds) {
    for (const neighbor of generateNeighbors(seed, criteria)) {
      const key = neighbor.label.toLowerCase();
      if (!byLabel.has(key)) {
        byLabel.set(key, neighbor);
      }
    }
  }

  return [...byLabel.values()];
}

/** Decide whether pass-2 regeneration should run (single pass only). */
export function shouldTriggerRegeneration(input: RegenerationTriggerInput): boolean {
  const { candidates, criteria } = input;
  const buyable = candidates.filter((c) => canPurchaseDomain(c));
  const buyableCount = buyable.length;

  if (buyableCount < MIN_BUYABLE_THRESHOLD) return true;

  const takenStrong = candidates
    .filter((c) => isTakenOrBenchmark(c) && c.signals.brand >= 60)
    .sort((a, b) => b.signals.brand - a.signals.brand)
    .slice(0, 5);

  if (takenStrong.length >= 4) return true;

  const brandableBuyable = buyable.filter(
    (c) => c.namingLane && BRANDABLE_LANES.includes(c.namingLane)
  );
  if (
    brandableBuyable.length === 0 &&
    ["business_brand", "local_service", "saas_app"].includes(criteria.intent)
  ) {
    return true;
  }

  const intentNeedsBrand = ["business_brand", "local_service", "saas_app"].includes(
    criteria.intent
  );
  if (intentNeedsBrand && buyable.length > 0 && buyable.every(isWeakKeywordBuyable)) {
    return true;
  }

  const topPreRank = [...candidates]
    .sort((a, b) => b.signals.brand - a.signals.brand)
    .slice(0, 5);
  const topTaken = topPreRank.filter((c) => isTakenOrBenchmark(c)).length;
  if (topTaken >= 4 && buyableCount < MIN_BUYABLE_THRESHOLD + 2) return true;

  return false;
}

/** Orchestrate seed selection + neighbor generation for thin buyable pools. */
export function regenerateForThinBuyablePool(
  candidates: DomainCandidate[],
  criteria: NamingCriteria
): LabeledCandidate[] {
  if (!shouldTriggerRegeneration({ candidates, criteria })) {
    return [];
  }

  const seeds = selectRegenerationSeeds(candidates, criteria);
  if (seeds.length === 0) return [];

  return regenerateFromBenchmark(seeds, criteria);
}

export function buildRegenerationMeta(input: {
  pass1Checked: number;
  pass2Checked: number;
  buyableCountBeforeRegeneration: number;
  buyableCountAfterRegeneration: number;
  regenerationTriggered: boolean;
  regenerationSeeds: string[];
  lanesExpanded: NamingLane[];
  queryLiteralness: QueryLiteralness;
  briefQuality: BriefQuality;
  literalRootUsed: boolean;
  literalRoot: string | null;
  missingContextWarning?: string | null;
}): GenerationMeta {
  return {
    pass1Checked: input.pass1Checked,
    pass2Checked: input.pass2Checked,
    buyableCountBeforeRegeneration: input.buyableCountBeforeRegeneration,
    buyableCountAfterRegeneration: input.buyableCountAfterRegeneration,
    regenerationTriggered: input.regenerationTriggered,
    regenerationSeeds: input.regenerationSeeds,
    generationPassesUsed: input.regenerationTriggered ? 2 : 1,
    lanesExpanded: input.lanesExpanded,
    queryLiteralness: input.queryLiteralness,
    briefQuality: input.briefQuality,
    literalRootUsed: input.literalRootUsed,
    literalRoot: input.literalRoot,
    ...(input.missingContextWarning ? { missingContextWarning: input.missingContextWarning } : {}),
  };
}

/** Expand pass-2 labels to domain strings with metadata, respecting check budget. */
export function expandRegenerationToDomains(
  labeled: LabeledCandidate[],
  tldPreference: string[],
  alreadyChecked: Set<string>,
  maxChecks = MAX_REGENERATION_CHECKS
): Array<{
  domain: string;
  namingLane: NamingLane;
  generationPass: 2;
  seedDomain?: string;
}> {
  const results: Array<{
    domain: string;
    namingLane: NamingLane;
    generationPass: 2;
    seedDomain?: string;
  }> = [];
  const seen = new Set<string>();

  for (const candidate of labeled) {
    for (const tld of tldPreference) {
      if (results.length >= maxChecks) return results;
      const domain = `${candidate.label.toLowerCase()}.${tld}`;
      const key = domain.toLowerCase();
      if (seen.has(key) || alreadyChecked.has(key)) continue;
      seen.add(key);
      results.push({
        domain,
        namingLane: candidate.lane,
        generationPass: 2,
        seedDomain: candidate.seedDomain,
      });
    }
  }

  return results.slice(0, maxChecks);
}

/** Merge pass-1 and pass-2 candidates; pass-1 wins on duplicate domains. */
export function mergeRegenerationCandidates(
  pass1: DomainCandidate[],
  pass2: DomainCandidate[]
): DomainCandidate[] {
  const byDomain = new Map<string, DomainCandidate>();

  for (const c of pass1) {
    byDomain.set(c.domain.toLowerCase(), c);
  }
  for (const c of pass2) {
    const key = c.domain.toLowerCase();
    if (!byDomain.has(key)) {
      byDomain.set(key, c);
    }
  }

  const buyable = [...byDomain.values()].filter((c) => canPurchaseDomain(c));
  const takenBenchmarks = [...byDomain.values()].filter(
    (c) => isTakenOrBenchmark(c) || isBenchmarkOnly(c)
  );
  const other = [...byDomain.values()].filter(
    (c) => !canPurchaseDomain(c) && !isTakenOrBenchmark(c) && !isBenchmarkOnly(c)
  );

  return [...buyable, ...other, ...takenBenchmarks];
}
