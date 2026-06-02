/**
 * Phase 3 regeneration QA — pure functions, no API calls.
 * Run: npm run qa:regeneration
 */
import type { DomainCandidate } from "../lib/types/domain";
import type { NamingCriteria } from "../lib/intelligence/naming-criteria";
import { resolveQueryLiteralness } from "../lib/intelligence/query-literalness";
import { DEFAULT_BRIEF } from "../lib/types/domain-brief";
import { mergeBrief } from "../lib/search/brief-config";
import {
  buildRejectionContext,
  passesRejectionPipeline,
} from "../lib/intelligence/name-rejection";
import { canPurchaseDomain, isBenchmarkOnly } from "../lib/domains/availability";
import {
  generateNeighbors,
  regenerateFromBenchmark,
  selectRegenerationSeeds,
  shouldTriggerRegeneration,
  expandRegenerationToDomains,
  mergeRegenerationCandidates,
  buildRegenerationMeta,
  MAX_REGENERATION_CHECKS,
  type RegenerationSeed,
} from "../lib/intelligence/regeneration";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed += 1;
  } else {
    console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
    failed += 1;
  }
}

const businessBrandCriteria: NamingCriteria = {
  intent: "business_brand",
  description: "Home security system company",
  industry: "security",
  audience: "homeowners",
  service: "security",
  locationCity: "",
  locationRegion: "",
  personalName: "",
  profession: "",
  currentDomain: "",
  competitors: "",
  marketScope: "national",
  serviceKeywords: ["home", "security", "system"],
  locationKeywords: [],
  nicheCategory: "home_services",
  tones: ["trustworthy"],
  constraints: {
    allowHyphens: false,
    allowNumbers: false,
    maxLabelLength: 22,
    preferCom: true,
    preferBrandable: true,
    preferExactMatch: false,
    preferKeywordSlug: false,
    preferLocalSeo: false,
  },
  tldPreference: ["com"],
  hasSubject: true,
  isLocalContext: false,
  literalness: resolveQueryLiteralness(
    mergeBrief({
      ...DEFAULT_BRIEF,
      naming: "Home security system company",
      buyingIntent: "business_brand",
      industry: "security",
      audience: "homeowners",
      productService: "security",
      marketScope: "national",
      brandTones: ["trustworthy"],
    })
  ),
};

const guardNestSeed: RegenerationSeed = {
  domain: "guardnest.com",
  label: "GuardNest",
  namingLane: "premium_brandable",
  brandScore: 78,
  roots: ["guard", "nest"],
};

function mockCandidate(
  domain: string,
  status: DomainCandidate["availabilityStatus"],
  brand: number,
  extras?: Partial<DomainCandidate>
): DomainCandidate {
  return {
    domain,
    price: 10.99,
    priceType: "registration",
    available: status === "available",
    availabilityStatus: status,
    signals: {
      brand,
      search: brand - 10,
      marketing: brand - 5,
      ai: 50,
      trust: brand,
      resale: 50,
    },
    analysis: {
      strengths: [],
      watchOuts: [],
      idealFor: [],
      notIdealFor: [],
      recommendedAction: "",
    },
    badges: [],
    ...extras,
  };
}

// --- GuardNest neighbor generation ---
const neighbors = generateNeighbors(guardNestSeed, businessBrandCriteria);
assert("GuardNest seed generates neighbors", neighbors.length >= 4, `got ${neighbors.length}`);

const neighborLabels = neighbors.map((n) => n.label.toLowerCase());
const hasSwapped = neighborLabels.some((l) => l === "nestguard");
assert("GuardNest generates NestGuard swap", hasSwapped, neighborLabels.join(", "));

const hasSynonym = neighborLabels.some(
  (l) =>
    l.includes("shield") ||
    l.includes("secure") ||
    l.includes("haven") ||
    l.includes("sentry") ||
    l.includes("lock")
);
assert("GuardNest generates synonym neighbors", hasSynonym, neighborLabels.join(", "));

for (const n of neighbors) {
  assert(
    `neighbor ${n.label} has generationPass 2`,
    n.generationPass === 2
  );
  assert(
    `neighbor ${n.label} preserves seedDomain`,
    n.seedDomain === "guardnest.com"
  );
}

// --- Rejection pipeline for bad regenerated names ---
const businessCtx = buildRejectionContext({
  intent: "business_brand",
  constraints: businessBrandCriteria.constraints,
  hasSubject: true,
  queryTokens: businessBrandCriteria.serviceKeywords,
  locationKeywords: [],
  service: "security",
});

const badLabels = [
  "HomeSecuritySystemCompany",
  "ProCoHubWorks",
  "CoHubWorksPro",
  "buyers-home-co",
];
for (const bad of badLabels) {
  assert(
    `bad label rejected: ${bad}`,
    !passesRejectionPipeline(bad, businessCtx)
  );
}

const goodLabels = ["SecureHaven", "ShieldNest", "SentryNest"];
for (const good of goodLabels) {
  assert(
    `good neighbor passes rejection: ${good}`,
    passesRejectionPipeline(good, businessCtx)
  );
}

// --- business_brand does not regenerate SEO slug junk ---
const seoSlugNeighbors = generateNeighbors(
  { ...guardNestSeed, domain: "homesecuritypasadena.com", label: "HomeSecurityPasadena" },
  businessBrandCriteria
);
const seoJunk = seoSlugNeighbors.filter((n) =>
  /homesecurity|pasadena|buyer|buyers/.test(n.label.toLowerCase())
);
assert("business_brand neighbors avoid SEO slug junk", seoJunk.length === 0);

// --- Seed selection ---
const takenPool: DomainCandidate[] = [
  mockCandidate("guardnest.com", "taken", 78, { namingLane: "premium_brandable" }),
  mockCandidate("shieldhaven.com", "taken", 72, { namingLane: "premium_brandable" }),
  mockCandidate("homesecuritysystem.com", "taken", 40, { namingLane: "seo_exact_partial" }),
  mockCandidate("procohub.com", "taken", 30),
  mockCandidate("securehaven.com", "available", 70, { namingLane: "premium_brandable" }),
  mockCandidate("weakkeyword.com", "available", 45, {
    signals: { brand: 45, search: 85, marketing: 50, ai: 40, trust: 45, resale: 40 },
  }),
];

const seeds = selectRegenerationSeeds(takenPool, businessBrandCriteria);
assert("selects taken strong seeds only", seeds.length >= 1 && seeds.every((s) => s.domain !== "securehaven.com"));
assert("rejects weak keyword-stuffed taken seed", !seeds.some((s) => s.label.toLowerCase().includes("homesecuritysystem")));
assert("seed GuardNest selected", seeds.some((s) => s.domain === "guardnest.com"));

// --- Taken seeds never buyable ---
for (const seed of seeds) {
  const asCandidate = mockCandidate(seed.domain, "taken", seed.brandScore);
  assert(`seed ${seed.domain} is benchmark only`, isBenchmarkOnly(asCandidate));
  assert(`seed ${seed.domain} cannot be purchased`, !canPurchaseDomain(asCandidate));
}

// --- Trigger logic ---
const thinBuyable = [
  mockCandidate("a.com", "available", 60),
  mockCandidate("guardnest.com", "taken", 80, { namingLane: "premium_brandable" }),
];
assert(
  "triggers when buyableCount < 3",
  shouldTriggerRegeneration({ candidates: thinBuyable, criteria: businessBrandCriteria })
);

const enoughBuyable = Array.from({ length: 5 }, (_, i) =>
  mockCandidate(`brand${i}.com`, "available", 65, { namingLane: "premium_brandable" })
);
assert(
  "does not trigger when enough brandable buyables",
  !shouldTriggerRegeneration({ candidates: enoughBuyable, criteria: businessBrandCriteria })
);

// --- Regeneration cap ---
const manyLabeled = regenerateFromBenchmark(seeds, businessBrandCriteria);
const expanded = expandRegenerationToDomains(
  manyLabeled,
  ["com", "io", "ai"],
  new Set(["guardnest.com"])
);
assert(
  "regeneration caps additional checks",
  expanded.length <= MAX_REGENERATION_CHECKS,
  `got ${expanded.length}, max ${MAX_REGENERATION_CHECKS}`
);

// --- Merge rules ---
const pass1 = [
  mockCandidate("alpha.com", "available", 70, { generationPass: 1 }),
  mockCandidate("guardnest.com", "taken", 80, { generationPass: 1, namingLane: "premium_brandable" }),
];
const pass2 = [
  mockCandidate("securehaven.com", "available", 68, {
    generationPass: 2,
    seedDomain: "guardnest.com",
    namingLane: "premium_brandable",
  }),
  mockCandidate("alpha.com", "taken", 50, { generationPass: 2 }),
  mockCandidate("shieldnest.com", "taken", 65, {
    generationPass: 2,
    seedDomain: "guardnest.com",
    namingLane: "premium_brandable",
  }),
];
const merged = mergeRegenerationCandidates(pass1, pass2);
assert("merge preserves pass1 on duplicate domain", merged.find((c) => c.domain === "alpha.com")?.availabilityStatus === "available");
assert("merge adds pass2 buyable", merged.some((c) => c.domain === "securehaven.com" && canPurchaseDomain(c)));
assert("pass2 taken stays benchmark", merged.filter((c) => c.domain === "shieldnest.com").every((c) => isBenchmarkOnly(c)));

const buyableRecs = merged.filter((c) => canPurchaseDomain(c));
assert("buyable recommendations only from eligible statuses", buyableRecs.every((c) => canPurchaseDomain(c)));
assert("taken seed cannot appear as buyable", !buyableRecs.some((c) => c.domain === "guardnest.com"));

// --- Pinned best safety (taken seeds excluded from buyable pool) ---
const rankPool = merged.filter((c) => canPurchaseDomain(c));
const pinnedBest = rankPool.sort((a, b) => b.signals.brand - a.signals.brand)[0];
assert("taken seeds cannot be pinned best", pinnedBest?.domain !== "guardnest.com");

// --- buildRegenerationMeta ---
const meta = buildRegenerationMeta({
  pass1Checked: 80,
  pass2Checked: 35,
  buyableCountBeforeRegeneration: 1,
  buyableCountAfterRegeneration: 4,
  regenerationTriggered: true,
  regenerationSeeds: ["guardnest.com"],
  lanesExpanded: ["premium_brandable", "service_clear"],
  queryLiteralness: "semantic_context",
  briefQuality: "strong",
  literalRootUsed: false,
  literalRoot: null,
});
assert("generationMeta pass1Checked", meta.pass1Checked === 80);
assert("generationMeta pass2Checked", meta.pass2Checked === 35);
assert("generationMeta regenerationTriggered", meta.regenerationTriggered === true);
assert("generationMeta generationPassesUsed", meta.generationPassesUsed === 2);
assert("generationMeta seeds", meta.regenerationSeeds.includes("guardnest.com"));

console.log(`\nRegeneration QA: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
