import type { NamingCriteria } from "@/lib/intelligence/naming-criteria";
import type { BuyingIntent } from "@/lib/types/domain-brief";
import type { LabeledCandidate, NamingLane } from "@/lib/types/naming";
import {
  buildRejectionContext,
  passesRejectionPipeline,
} from "@/lib/intelligence/name-rejection";
import {
  expandVocabulary,
  extractConcepts,
  generateRoleTemplateCandidates,
  ROLE_BUCKETS,
} from "@/lib/intelligence/semantic-expansion";
import {
  allocateLabelBudget,
  getLaneQuotasForIntent,
  type LaneQuotaConstraints,
} from "@/lib/intelligence/lane-quotas";
import {
  generateKeywordRootCandidates,
  generateLiteralRootBrandables,
} from "@/lib/intelligence/keyword-root";
import {
  corpusHasHomeSecurityConcepts,
  usesLiteralRoot,
} from "@/lib/intelligence/query-literalness";

const LANE_PRIORITY: NamingLane[] = [
  "keyword_root",
  "premium_brandable",
  "service_clear",
  "saas_app",
  "short_punchy",
  "local_service",
  "premium_upgrade",
  "investor_resale",
  "seo_exact_partial",
  "defensive",
];

const SEO_SUFFIXES = ["Guide", "Reviews", "Hub", "Insider", "Daily", "Central", "Expert", "Tips"];
const SEO_PREFIXES = ["Best", "Smart", "Top", "Ultimate", "Pro"];
const LOCAL_TRUST_SUFFIXES = ["Co", "Pros", "Group", "Team", "HQ"];
const TECH_SUFFIXES = ["Flow", "Loop", "Grid", "IQ", "Pulse", "Stack", "Port", "Sync", "Signal", "Pilot"];
const ECOMM_SUFFIXES = ["Shop", "Store", "Market", "Goods", "Direct"];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, " ")
    .split(/[\s,_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
}

function buildCorpus(criteria: NamingCriteria): string {
  return [criteria.description, criteria.industry, criteria.service, criteria.audience]
    .filter(Boolean)
    .join(" ");
}

function laneConstraints(criteria: NamingCriteria): LaneQuotaConstraints {
  return {
    preferExactMatch: criteria.constraints.preferExactMatch,
    preferKeywordSlug: criteria.constraints.preferKeywordSlug,
    isLocalContext: criteria.isLocalContext,
  };
}

function rejectionContext(criteria: NamingCriteria) {
  return buildRejectionContext({
    intent: criteria.intent,
    constraints: criteria.constraints,
    hasSubject: criteria.hasSubject,
    queryTokens: [
      ...tokenize(criteria.description),
      ...criteria.serviceKeywords,
    ],
    locationKeywords: criteria.locationKeywords,
    service: criteria.service,
  });
}

function tagCandidates(
  labels: string[],
  lane: NamingLane,
  roots?: string[]
): LabeledCandidate[] {
  return labels.map((label) => ({
    label,
    lane,
    roots,
    generationPass: 1 as const,
  }));
}

function filterByRejection(
  candidates: LabeledCandidate[],
  criteria: NamingCriteria
): LabeledCandidate[] {
  const ctx = rejectionContext(criteria);
  return candidates.filter((c) => passesRejectionPipeline(c.label, ctx));
}

function uniqueLabels(candidates: LabeledCandidate[]): LabeledCandidate[] {
  return dedupeLabeledCandidates(candidates);
}

function conceptOptions(criteria: NamingCriteria) {
  return {
    literalRoot: criteria.literalness.literalRoot,
    keywordAnchored: usesLiteralRoot(criteria.literalness),
  };
}

function isLiteralSeedMode(criteria: NamingCriteria): boolean {
  return usesLiteralRoot(criteria.literalness);
}

/** Lanes enabled for this intent given quota config. */
export function getEnabledLanesForIntent(criteria: NamingCriteria): NamingLane[] {
  const quotas = getLaneQuotasForIntent(
    criteria.intent,
    laneConstraints(criteria),
    criteria.literalness
  );
  return LANE_PRIORITY.filter((lane) => (quotas[lane] ?? 0) > 0);
}

function generatePremiumBrandableLane(criteria: NamingCriteria): LabeledCandidate[] {
  const corpus = buildCorpus(criteria);
  const literalSeed = isLiteralSeedMode(criteria);
  const securityCorpus = corpusHasHomeSecurityConcepts(corpus);

  if (literalSeed && !securityCorpus) {
    return uniqueLabels([
      ...generateLiteralRootBrandables(criteria, "premium_brandable"),
      ...filterByRejection(
        generateRoleTemplateCandidates(corpus, {
          lane: "premium_brandable",
          maxPerTemplate: 6,
        }).filter((c) =>
          c.label.toLowerCase().includes(criteria.literalness.literalRoot!.toLowerCase())
        ),
        criteria
      ),
    ]);
  }

  const fromTemplates = generateRoleTemplateCandidates(corpus, {
    lane: "premium_brandable",
    maxPerTemplate: 10,
  });
  const concepts = extractConcepts(corpus, conceptOptions(criteria));
  const vocab = expandVocabulary(concepts);
  const extra: LabeledCandidate[] = [];

  for (const left of vocab.protection.slice(0, 6)) {
    for (const right of vocab.place.slice(0, 6)) {
      if (left.toLowerCase() === right.toLowerCase()) continue;
      extra.push({
        label: capitalize(left) + capitalize(right),
        lane: "premium_brandable",
        roots: [left, right],
        generationPass: 1,
      });
    }
  }
  for (const left of vocab.trust.slice(0, 4)) {
    for (const right of vocab.place.slice(0, 4)) {
      extra.push({
        label: capitalize(left) + capitalize(right),
        lane: "premium_brandable",
        roots: [left, right],
        generationPass: 1,
      });
    }
  }
  for (const left of vocab.protection.slice(0, 6)) {
    for (const tech of vocab.tech.slice(0, 6)) {
      if (left.toLowerCase() === tech.toLowerCase()) continue;
      extra.push({
        label: capitalize(left) + capitalize(tech),
        lane: "premium_brandable",
        roots: [left, tech],
        generationPass: 1,
      });
    }
  }

  const taggedTemplates = fromTemplates.map((c) => ({
    ...c,
    generationPass: 1 as const,
  }));

  return uniqueLabels([...taggedTemplates, ...extra]);
}

function generateServiceClearLane(criteria: NamingCriteria): LabeledCandidate[] {
  const corpus = buildCorpus(criteria);
  if (isLiteralSeedMode(criteria) && !corpusHasHomeSecurityConcepts(corpus)) {
    return generateLiteralRootBrandables(criteria, "service_clear");
  }

  const fromTemplates = generateRoleTemplateCandidates(corpus, {
    lane: "service_clear",
    maxPerTemplate: 10,
  });
  const concepts = extractConcepts(corpus, conceptOptions(criteria));
  const vocab = expandVocabulary(concepts);
  const extra: LabeledCandidate[] = [];

  for (const place of vocab.place.slice(0, 5)) {
    for (const prot of vocab.protection.slice(0, 6)) {
      extra.push({
        label: capitalize(place) + capitalize(prot),
        lane: "service_clear",
        roots: [place, prot],
        generationPass: 1,
      });
    }
  }

  for (const alert of vocab.alert.slice(0, 4)) {
    for (const tech of vocab.tech.slice(0, 4)) {
      extra.push({
        label: capitalize(alert) + capitalize(tech),
        lane: "service_clear",
        roots: [alert, tech],
        generationPass: 1,
      });
    }
    for (const suffix of TECH_SUFFIXES.slice(0, 6)) {
      if (alert.toLowerCase() === suffix.toLowerCase()) continue;
      extra.push({
        label: capitalize(alert) + suffix,
        lane: "service_clear",
        roots: [alert, suffix],
        generationPass: 1,
      });
    }
  }

  for (const prot of vocab.protection.slice(0, 4)) {
    for (const sig of vocab.alert.slice(0, 4)) {
      if (prot.toLowerCase() === sig.toLowerCase()) continue;
      extra.push({
        label: capitalize(prot) + capitalize(sig),
        lane: "service_clear",
        roots: [prot, sig],
        generationPass: 1,
      });
    }
  }

  const service = criteria.service ? capitalize(criteria.service) : "";
  if (service) {
    for (const prot of vocab.protection.slice(0, 6)) {
      extra.push({
        label: service + prot,
        lane: "service_clear",
        roots: [service, prot],
        generationPass: 1,
      });
    }
  }

  const taggedTemplates = fromTemplates.map((c) => ({
    ...c,
    generationPass: 1 as const,
  }));

  return uniqueLabels([...taggedTemplates, ...extra]);
}

function generateSaasAppLane(criteria: NamingCriteria): LabeledCandidate[] {
  const corpus = buildCorpus(criteria);
  if (isLiteralSeedMode(criteria) && !corpusHasHomeSecurityConcepts(corpus)) {
    return generateKeywordRootCandidates(criteria, "saas_app");
  }

  const fromTemplates = generateRoleTemplateCandidates(corpus, {
    lane: "saas_app",
    maxPerTemplate: 10,
  });
  const concepts = extractConcepts(corpus, conceptOptions(criteria));
  const vocab = expandVocabulary(concepts);
  const extra: LabeledCandidate[] = [];

  const roots = [...vocab.protection, ...vocab.alert, ...vocab.tech].slice(0, 10);
  for (const r of roots) {
    for (const suffix of TECH_SUFFIXES.slice(0, 8)) {
      if (r.toLowerCase() === suffix.toLowerCase()) continue;
      extra.push({
        label: capitalize(r) + suffix,
        lane: "saas_app",
        roots: [r, suffix],
        generationPass: 1,
      });
    }
  }

  const taggedTemplates = fromTemplates.map((c) => ({
    ...c,
    generationPass: 1 as const,
  }));

  return uniqueLabels([...taggedTemplates, ...extra]);
}

function generateLocalServiceLane(criteria: NamingCriteria): LabeledCandidate[] {
  const city = criteria.locationCity;
  const service = criteria.service;
  if (!city || !service) return [];

  const cityCap = capitalize(city);
  const serviceCap = capitalize(service);
  const labels: string[] = [];

  for (const suffix of LOCAL_TRUST_SUFFIXES.slice(0, 3)) {
    labels.push(cityCap + serviceCap + suffix);
  }
  labels.push(serviceCap + cityCap);
  labels.push(cityCap + serviceCap);

  if (criteria.constraints.preferKeywordSlug) {
    labels.push(service + city);
    labels.push(city + service);
  }

  return tagCandidates(labels, "local_service", [city, service]);
}

function generateSeoExactPartialLane(criteria: NamingCriteria): LabeledCandidate[] {
  const tokens = [
    ...criteria.serviceKeywords,
    ...tokenize(criteria.description),
    ...tokenize(criteria.industry),
  ].filter((t, i, a) => a.indexOf(t) === i);

  if (tokens.length === 0 && criteria.literalness.literalRoot) {
    tokens.push(criteria.literalness.literalRoot);
  }

  if (tokens.length === 0) return [];

  const labels = new Set<string>();
  const joined = tokens.slice(0, 4).map(capitalize).join("");
  labels.add(joined);
  if (criteria.constraints.allowHyphens) {
    labels.add(tokens.slice(0, 4).join("-"));
  }

  for (const prefix of SEO_PREFIXES) {
    labels.add(prefix + capitalize(tokens[0]) + tokens.slice(1).map(capitalize).join(""));
  }
  for (const suffix of SEO_SUFFIXES) {
    labels.add(capitalize(tokens[0]) + suffix);
    labels.add(joined + suffix);
  }

  return tagCandidates([...labels], "seo_exact_partial", tokens.slice(0, 4));
}

function generateInvestorResaleLane(criteria: NamingCriteria): LabeledCandidate[] {
  if (isLiteralSeedMode(criteria)) {
    const rootLabels = generateKeywordRootCandidates(criteria, "investor_resale");
    const short = generateKeywordRootCandidates(criteria, "short_punchy").slice(0, 8);
    return uniqueLabels([...rootLabels, ...short]);
  }

  const corpus = buildCorpus(criteria);
  const concepts = extractConcepts(corpus, conceptOptions(criteria));
  const vocab = expandVocabulary(concepts);
  const labels: string[] = [];

  const core = [...vocab.protection, ...vocab.place, ...ROLE_BUCKETS.trust].slice(0, 8);
  const brand = [...vocab.place, ...ROLE_BUCKETS.trust].slice(0, 6);
  const market = ["Hub", "Direct", "Pros", "Market", "Source"];

  for (const c of core) {
    for (const b of brand) {
      if (c.toLowerCase() !== b.toLowerCase()) {
        labels.push(capitalize(c) + capitalize(b));
      }
    }
    for (const m of market) {
      labels.push(capitalize(c) + m);
    }
  }

  for (const s of ["Brandly", "Nestio", "Guardly", "Marketio"]) {
    labels.push(s);
  }

  return tagCandidates(labels, "investor_resale");
}

function generateDefensiveLane(criteria: NamingCriteria): LabeledCandidate[] {
  const base =
    criteria.currentDomain.replace(/^https?:\/\//, "").split(".")[0] || "";
  if (!base) return [];

  const labels = [base, base + "hq", "get" + capitalize(base), "my" + capitalize(base)];
  return tagCandidates(labels, "defensive", [base]);
}

function generateShortPunchyLane(criteria: NamingCriteria): LabeledCandidate[] {
  if (isLiteralSeedMode(criteria)) {
    return generateKeywordRootCandidates(criteria, "short_punchy").filter(
      (c) => c.label.length <= 12
    );
  }

  const corpus = buildCorpus(criteria);
  const concepts = extractConcepts(corpus, conceptOptions(criteria));
  const vocab = expandVocabulary(concepts);
  const labels: string[] = [];

  const pool = [
    ...vocab.protection,
    ...vocab.alert,
    ...vocab.place,
  ].slice(0, 8);

  for (const word of pool) {
    if (word.length >= 4 && word.length <= 8) {
      labels.push(capitalize(word));
    }
  }

  for (const left of pool.slice(0, 4)) {
    for (const right of ["Go", "Now", "HQ", "App"]) {
      labels.push(capitalize(left) + right);
    }
  }

  return tagCandidates(labels, "short_punchy");
}

function generatePremiumUpgradeLane(criteria: NamingCriteria): LabeledCandidate[] {
  const current =
    criteria.currentDomain.replace(/^https?:\/\//, "").split(".")[0] || "";
  const labels: string[] = [];

  if (current) {
    labels.push(current);
    labels.push("get" + capitalize(current));
    labels.push(capitalize(current) + "HQ");
  }

  const brandable = generatePremiumBrandableLane(criteria).slice(0, 12);
  return uniqueLabels([
    ...tagCandidates(labels, "premium_upgrade"),
    ...brandable.map((c) => ({ ...c, lane: "premium_upgrade" as NamingLane })),
  ]);
}

function generatePersonalBrandLane(criteria: NamingCriteria): LabeledCandidate[] {
  const nameParts = tokenize(criteria.personalName || criteria.description);
  if (nameParts.length === 0) return [];

  const first = capitalize(nameParts[0]);
  const last = nameParts.length > 1 ? capitalize(nameParts[nameParts.length - 1]) : "";
  const labels: string[] = [];

  if (last) labels.push(first + last);
  labels.push(first);
  labels.push(first + "HQ");
  labels.push(first + "Studio");

  const profession = tokenize(criteria.profession)[0];
  if (profession) {
    labels.push(first + capitalize(profession));
  }

  return tagCandidates(labels, "premium_brandable", nameParts);
}

function generateEcommerceLane(criteria: NamingCriteria): LabeledCandidate[] {
  const brand = generatePremiumBrandableLane(criteria);
  const product = criteria.service || criteria.serviceKeywords[0];
  const extra: LabeledCandidate[] = [];

  if (product) {
    const p = capitalize(product);
    for (const s of ECOMM_SUFFIXES) {
      extra.push({
        label: p + s,
        lane: "service_clear",
        roots: [p, s],
        generationPass: 1,
      });
    }
  }

  return uniqueLabels([...brand, ...extra]);
}

function generateKeywordRootLane(criteria: NamingCriteria): LabeledCandidate[] {
  return generateKeywordRootCandidates(criteria, "keyword_root");
}

const LANE_GENERATORS: Record<
  NamingLane,
  (criteria: NamingCriteria) => LabeledCandidate[]
> = {
  premium_brandable: generatePremiumBrandableLane,
  service_clear: generateServiceClearLane,
  local_service: generateLocalServiceLane,
  saas_app: generateSaasAppLane,
  seo_exact_partial: generateSeoExactPartialLane,
  investor_resale: generateInvestorResaleLane,
  defensive: generateDefensiveLane,
  short_punchy: generateShortPunchyLane,
  premium_upgrade: generatePremiumUpgradeLane,
  keyword_root: generateKeywordRootLane,
};

function shouldAllowSeoLane(criteria: NamingCriteria): boolean {
  return (
    criteria.intent === "seo_content" ||
    criteria.constraints.preferExactMatch ||
    criteria.constraints.preferKeywordSlug ||
    criteria.literalness.queryLiteralness === "exact_partial_required" ||
    criteria.literalness.queryLiteralness === "keyword_required"
  );
}

/** Expand vocabulary and rerun brandable/service lanes when output is thin. */
function expandAndRerunBrandableLanes(criteria: NamingCriteria): LabeledCandidate[] {
  if (isLiteralSeedMode(criteria)) {
    return generateKeywordRootCandidates(criteria, "premium_brandable");
  }

  const corpus = buildCorpus(criteria);
  const concepts = extractConcepts(corpus, conceptOptions(criteria));
  const vocab = expandVocabulary(concepts);
  const extra: LabeledCandidate[] = [];

  const allProtection = [...new Set([...vocab.protection, ...ROLE_BUCKETS.protection])];
  const allPlace = [...new Set([...vocab.place, ...ROLE_BUCKETS.place])];
  const allTech = [...new Set([...vocab.tech, ...ROLE_BUCKETS.tech])];

  for (const left of allProtection) {
    for (const right of allPlace) {
      extra.push({
        label: capitalize(left) + capitalize(right),
        lane: "premium_brandable",
        roots: [left, right],
        generationPass: 1,
      });
    }
    for (const tech of allTech) {
      extra.push({
        label: capitalize(left) + capitalize(tech),
        lane: "saas_app",
        roots: [left, tech],
        generationPass: 1,
      });
    }
  }

  return filterByRejection(extra, criteria);
}

/** Run all lane generators for an intent (before quota trimming). */
export function generateLaneCandidates(criteria: NamingCriteria): LabeledCandidate[] {
  let enabled = getEnabledLanesForIntent(criteria);

  if (!shouldAllowSeoLane(criteria)) {
    enabled = enabled.filter((l) => l !== "seo_exact_partial");
  }

  let all: LabeledCandidate[] = [];

  if (criteria.intent === "personal_brand") {
    all.push(...generatePersonalBrandLane(criteria));
  } else if (criteria.intent === "ecommerce_store") {
    all.push(...generateEcommerceLane(criteria));
  } else {
    for (const lane of enabled) {
      const gen = LANE_GENERATORS[lane];
      if (gen) all.push(...gen(criteria));
    }
  }

  all = filterByRejection(all, criteria);

  if (all.length < 8 && !shouldAllowSeoLane(criteria) && !isLiteralSeedMode(criteria)) {
    all = uniqueLabels([...all, ...expandAndRerunBrandableLanes(criteria)]);
  }

  if (all.length < 8 && shouldAllowSeoLane(criteria)) {
    all = uniqueLabels([
      ...all,
      ...filterByRejection(generateSeoExactPartialLane(criteria), criteria),
    ]);
  }

  return all;
}

/** Keep one entry per label; prefer higher-priority lane. */
export function dedupeLabeledCandidates(candidates: LabeledCandidate[]): LabeledCandidate[] {
  const byLabel = new Map<string, LabeledCandidate>();

  for (const c of candidates) {
    const key = c.label.toLowerCase();
    const existing = byLabel.get(key);
    if (!existing) {
      byLabel.set(key, c);
      continue;
    }
    const existingPri = LANE_PRIORITY.indexOf(existing.lane);
    const newPri = LANE_PRIORITY.indexOf(c.lane);
    if (newPri >= 0 && (existingPri < 0 || newPri < existingPri)) {
      byLabel.set(key, c);
    }
  }

  return [...byLabel.values()];
}

function scoreLabelForLane(label: string, criteria?: NamingCriteria): number {
  const norm = label.toLowerCase().replace(/-/g, "");
  const root = criteria?.literalness.literalRoot?.toLowerCase();

  if (root && norm.includes(root)) return -2;

  const qualityBoost = new Set([
    "guardnest",
    "securehaven",
    "shieldnest",
    "homesentry",
    "alertpilot",
    "watchgrid",
    "sentryloop",
    "guardflow",
    "locksignal",
    "shieldhaven",
    "havenguard",
  ]);
  if (qualityBoost.has(norm)) return -1;

  if (root && criteria && isLiteralSeedMode(criteria)) {
    const securityLike = /guard|nest|haven|sentry|shield|home|lock|secure/.test(norm);
    if (securityLike && !corpusHasHomeSecurityConcepts(criteria.description)) {
      return 8;
    }
  }

  const hasCompound = /[a-z][A-Z].*[A-Z]/.test(label) || /^[A-Z][a-z]+[A-Z]/.test(label);
  if (hasCompound && label.length >= 8 && label.length <= 14) return 0;
  if (/^[A-Z][a-z]+[A-Z]/.test(label)) return 1;
  return 5;
}

/** Apply intent lane quotas to select top candidates per lane. */
export function prioritizeCandidatesByLane(
  candidates: LabeledCandidate[],
  criteria: NamingCriteria,
  totalBudget = 45
): LabeledCandidate[] {
  const quotas = getLaneQuotasForIntent(
    criteria.intent,
    laneConstraints(criteria),
    criteria.literalness
  );
  const budget = allocateLabelBudget(quotas, totalBudget);
  const byLane = new Map<NamingLane, LabeledCandidate[]>();

  for (const c of candidates) {
    const list = byLane.get(c.lane) ?? [];
    list.push(c);
    byLane.set(c.lane, list);
  }

  const result: LabeledCandidate[] = [];
  for (const lane of LANE_PRIORITY) {
    const max = budget[lane] ?? 0;
    if (max <= 0) continue;
    const pool = [...(byLane.get(lane) ?? [])].sort(
      (a, b) => scoreLabelForLane(a.label, criteria) - scoreLabelForLane(b.label, criteria)
    );
    result.push(...pool.slice(0, max));
  }

  return dedupeLabeledCandidates(result);
}

/** Full lane pipeline: generate, reject, quota, dedupe. */
export function runLanesForIntent(criteria: NamingCriteria): LabeledCandidate[] {
  const generated = generateLaneCandidates(criteria);
  const prioritized = prioritizeCandidatesByLane(generated, criteria);
  return prioritized.map((c) => ({ ...c, generationPass: c.generationPass ?? 1 }));
}

export function intentUsesLanes(intent: BuyingIntent): boolean {
  return intent !== null;
}
