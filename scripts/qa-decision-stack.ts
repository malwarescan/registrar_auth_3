/**
 * Phase 4 Decision Stack QA — pure functions, no API calls.
 * Run: npm run qa:decision-stack
 */
import type { DomainCandidate } from "../lib/types/domain";
import { pickDecisionStack } from "../lib/intelligence/score-domain";
import { enrichCandidate } from "../lib/intelligence/dashboard";
import {
  canPurchaseDomain,
  isBenchmarkOnly,
  isRecommendationEligible,
  shouldShowPrice,
} from "../lib/domains/availability";

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

function mockCandidate(
  domain: string,
  status: DomainCandidate["availabilityStatus"],
  signals: Partial<DomainCandidate["signals"]> = {},
  extras?: Partial<DomainCandidate>
): DomainCandidate {
  const brand = signals.brand ?? 60;
  return enrichCandidate({
    domain,
    price: 10.99,
    priceType: "registration",
    available: status === "available",
    availabilityStatus: status,
    signals: {
      brand,
      search: signals.search ?? brand - 5,
      marketing: signals.marketing ?? brand - 3,
      ai: signals.ai ?? brand - 2,
      trust: signals.trust ?? brand,
      resale: signals.resale ?? 50,
    },
    analysis: {
      strengths: ["Strong fit"],
      watchOuts: [],
      idealFor: ["Launch"],
      notIdealFor: ["Generic use"],
      recommendedAction: "Register if available",
    },
    badges: [],
    ...extras,
  });
}

const eligiblePool: DomainCandidate[] = [
  mockCandidate("alphabrand.com", "available", { brand: 88, search: 70, ai: 75, trust: 85, resale: 55 }),
  mockCandidate("keywordseo.com", "available", { brand: 62, search: 92, ai: 68, trust: 70, resale: 45 }),
  mockCandidate("aiclear.com", "available", { brand: 70, search: 72, ai: 94, trust: 78, resale: 50 }),
  mockCandidate("cheapvalue.com", "available", { brand: 65, search: 68, ai: 70, trust: 80, resale: 48 }, { price: 4.99 }),
  mockCandidate("safest.com", "available", { brand: 72, search: 65, ai: 70, trust: 95, resale: 52 }),
  mockCandidate("investor.com", "premium_available", { brand: 75, search: 60, ai: 65, trust: 82, resale: 88 }),
];

const mixedPool = [
  ...eligiblePool,
  mockCandidate("guardnest.com", "taken", { brand: 90, search: 75, ai: 80 }),
  mockCandidate("benchmark.com", "benchmark_only", { brand: 85, search: 70, ai: 78 }),
  mockCandidate("idea.com", "idea_only", { brand: 80, search: 70, ai: 75 }),
  mockCandidate("unknown.com", "unknown", { brand: 78, search: 68, ai: 72 }),
  mockCandidate("error.com", "api_error", { brand: 76, search: 66, ai: 70 }),
];

const stack = pickDecisionStack(mixedPool);

for (const slot of Object.values(stack)) {
  if (!slot) continue;
  assert(`stack slot ${slot.domain} is recommendation eligible`, isRecommendationEligible(slot));
  assert(`stack slot ${slot.domain} is not benchmark`, !isBenchmarkOnly(slot));
  assert(`stack slot ${slot.domain} is not taken`, slot.availabilityStatus !== "taken");
}

assert("DecisionStack has brand slot", Boolean(stack.brand));
assert("DecisionStack has seo slot", Boolean(stack.seo));
assert("DecisionStack has ai slot", Boolean(stack.ai));
assert("DecisionStack has overall slot", Boolean(stack.overall));
assert("DecisionStack has value slot", Boolean(stack.value));
assert("DecisionStack has risk slot", Boolean(stack.risk));

const brandRanked = [...eligiblePool].sort((a, b) => b.signals.brand - a.signals.brand);
const topBrandDomains = brandRanked.slice(0, 2).map((c) => c.domain);
assert(
  "brand slot picks a top brand candidate",
  topBrandDomains.includes(stack.brand.domain),
  stack.brand.domain
);
assert("seo slot picks highest search", stack.seo.domain === "keywordseo.com");
assert("ai slot picks highest ai", stack.ai.domain === "aiclear.com");

const riskSorted = [...eligiblePool].sort(
  (a, b) => (a.riskScore ?? 50) - (b.riskScore ?? 50)
);
assert(
  "risk slot picks lowest risk among eligible pool",
  stack.risk?.domain === riskSorted[0]?.domain,
  `expected ${riskSorted[0]?.domain}, got ${stack.risk?.domain}`
);

const investmentPool = [
  ...eligiblePool,
  mockCandidate("filler.com", "available", { brand: 55, search: 55, ai: 55, trust: 70, resale: 40 }),
];
const investmentStack = pickDecisionStack(investmentPool, { intent: "domain_investment" });
assert(
  "resale slot appears for domain_investment",
  Boolean(investmentStack.resale),
  investmentStack.resale?.domain
);
assert(
  "resale slot picks strong resale candidate",
  investmentStack.resale?.domain === "investor.com"
);

const brandOnlyStack = pickDecisionStack(eligiblePool.slice(0, 3));
assert("backward compatible brand/seo/ai shape", Boolean(brandOnlyStack.brand && brandOnlyStack.seo && brandOnlyStack.ai));

try {
  pickDecisionStack([
    mockCandidate("taken.com", "taken", { brand: 99 }),
    mockCandidate("bench.com", "benchmark_only", { brand: 98 }),
  ]);
  assert("throws when no eligible candidates", false);
} catch {
  assert("throws when no eligible candidates", true);
}

for (const slot of Object.values(stack)) {
  if (!slot) continue;
  if (!canPurchaseDomain(slot)) {
    assert(`non-purchasable ${slot.domain} hides price`, !shouldShowPrice(slot));
  }
}

console.log(`\nDecision Stack QA: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
