/**
 * Phase 1 foundation QA — no API calls.
 * Run: npm run qa:generation-foundation
 */
import type { BuyingIntent } from "../lib/types/domain-brief";
import type { DecisionStack } from "../lib/types/domain";
import type { NamingLane } from "../lib/types/naming";
import { ALL_NAMING_LANES } from "../lib/types/naming";
import {
  buildRejectionContext,
  passesRejectionPipeline,
  getRejectionReasons,
} from "../lib/intelligence/name-rejection";
import {
  extractConcepts,
  expandVocabulary,
  buildCompoundTemplates,
  generateRoleTemplateCandidates,
} from "../lib/intelligence/semantic-expansion";
import {
  DEFAULT_LANE_QUOTAS,
  getLaneQuotasForIntent,
  normalizeLaneQuotas,
} from "../lib/intelligence/lane-quotas";
import type { DomainBrief } from "../lib/types/domain-brief";
import { mergeBrief } from "../lib/search/brief-config";
import { extractNamingCriteria } from "../lib/intelligence/naming-criteria";
import {
  generateLaneCandidateDomains,
  generateCandidateDomains,
} from "../lib/intelligence/generate-candidates";
import {
  runLanesForIntent,
  getEnabledLanesForIntent,
} from "../lib/intelligence/naming-lanes";

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

const HOME_SECURITY_CORPUS = "Home security system company";
const GUARD_NEST_CLASS = [
  "GuardNest",
  "ShieldHaven",
  "HomeSentry",
  "HavenGuard",
  "AlertPilot",
  "WatchGrid",
  "SentryLoop",
  "GuardFlow",
  "LockSignal",
  "SecureHaven",
  "ShieldNest",
];

const businessBrandCtx = buildRejectionContext({
  intent: "business_brand",
  constraints: {
    allowHyphens: false,
    allowNumbers: false,
    maxLabelLength: 22,
    preferBrandable: true,
    preferExactMatch: false,
    preferKeywordSlug: false,
  },
  hasSubject: true,
  queryTokens: ["home", "security", "system", "company"],
  locationKeywords: [],
  service: "security",
});

// --- Semantic expansion ---
const concepts = extractConcepts(HOME_SECURITY_CORPUS);
assert("extractConcepts finds protection role", concepts.roles.includes("protection"));
assert("extractConcepts finds place role", concepts.roles.includes("place"));

const vocab = expandVocabulary(concepts);
assert("expandVocabulary protection bucket", vocab.protection.some((t) => t.toLowerCase() === "guard"));
assert("expandVocabulary place bucket", vocab.place.some((t) => t.toLowerCase() === "nest"));

const templates = buildCompoundTemplates(vocab);
assert("buildCompoundTemplates non-empty", templates.length > 0);

const candidates = generateRoleTemplateCandidates(HOME_SECURITY_CORPUS);
const labels = candidates.map((c) => c.label);
const matchedGuardNestClass = GUARD_NEST_CLASS.filter((name) =>
  labels.some((l) => l.toLowerCase() === name.toLowerCase())
);
assert(
  "generateRoleTemplateCandidates GuardNest-class names",
  matchedGuardNestClass.length >= 6,
  `got ${matchedGuardNestClass.length}: ${matchedGuardNestClass.join(", ")}`
);

// --- Rejection pipeline ---
const mustReject = [
  "homesecuritysystem",
  "securitysystemhome",
  "homeSecuritySystemCompany",
  "GuardGuard",
  "SecuritySecure",
  "ProCo",
  "HubWorks",
  "CoHub",
  "WorksPro",
];

for (const label of mustReject) {
  assert(
    `rejects ${label}`,
    !passesRejectionPipeline(label, businessBrandCtx),
    getRejectionReasons(label, businessBrandCtx).join(", ")
  );
}

assert(
  "accepts GuardNest for business_brand",
  passesRejectionPipeline("GuardNest", businessBrandCtx)
);

// --- Lane quotas ---
const ALL_INTENTS: BuyingIntent[] = [
  "business_brand",
  "personal_brand",
  "local_service",
  "saas_app",
  "seo_content",
  "domain_investment",
  "brand_protection",
  "premium_upgrade",
  "campaign_landing",
  "ecommerce_store",
];

for (const intent of ALL_INTENTS) {
  assert(`DEFAULT_LANE_QUOTAS has ${intent}`, Boolean(DEFAULT_LANE_QUOTAS[intent]));
  const quotas = getLaneQuotasForIntent(intent, {
    preferExactMatch: false,
    preferKeywordSlug: false,
    isLocalContext: false,
  });
  assert(`${intent} quotas non-empty`, Object.keys(quotas).length > 0);
}

const brandQuotas = getLaneQuotasForIntent("business_brand", {
  preferExactMatch: false,
  preferKeywordSlug: false,
  isLocalContext: false,
});
assert(
  "business_brand favors premium_brandable",
  (brandQuotas.premium_brandable ?? 0) >= (brandQuotas.seo_exact_partial ?? 0)
);
assert(
  "business_brand seo lane removed without explicit SEO pref",
  brandQuotas.seo_exact_partial === undefined
);

const seoQuotas = getLaneQuotasForIntent("seo_content", {
  preferExactMatch: false,
  preferKeywordSlug: false,
  isLocalContext: false,
});
assert(
  "seo_content favors seo_exact_partial",
  (seoQuotas.seo_exact_partial ?? 0) >= 0.5
);

const investmentQuotas = getLaneQuotasForIntent("domain_investment", {
  preferExactMatch: false,
  preferKeywordSlug: false,
  isLocalContext: false,
});
assert(
  "domain_investment favors investor_resale",
  (investmentQuotas.investor_resale ?? 0) >= 0.25
);

const normalized = normalizeLaneQuotas(
  { premium_brandable: 0.4, seo_exact_partial: 0.2, service_clear: 0.4 },
  { preferExactMatch: false, preferKeywordSlug: false, isLocalContext: false }
);
assert("normalizeLaneQuotas removes seo when not allowed", normalized.seo_exact_partial === undefined);

// --- Type compile smoke (runtime) ---
const _lane: NamingLane = "premium_brandable";
const _lanes = ALL_NAMING_LANES;
assert("NamingLane values compile", _lanes.includes(_lane));

const _stack: DecisionStack = {
  brand: {} as DecisionStack["brand"],
  seo: {} as DecisionStack["seo"],
  ai: {} as DecisionStack["ai"],
};
assert("DecisionStack type accepts extended shape", Boolean(_stack.brand));

// --- Phase 2: lane-based generation ---
const homeSecurityBrief: DomainBrief = mergeBrief({
  naming: "Home security system company",
  buyingIntent: "business_brand",
  searchGoal: "business_brand",
  industry: "Home security",
  audience: "Homeowners",
  brandTones: ["Trustworthy"],
  requirements: ["brandable", ".com preferred"],
  tldPreference: "com",
});

const criteria = extractNamingCriteria(homeSecurityBrief);
assert("extractNamingCriteria for home security", Boolean(criteria));

if (criteria) {
  const laneCandidates = runLanesForIntent(criteria);
  assert("runLanesForIntent returns candidates", laneCandidates.length > 0);
  assert(
    "all lane candidates have namingLane",
    laneCandidates.every((c) => Boolean(c.lane))
  );
  assert(
    "all lane candidates have generationPass 1",
    laneCandidates.every((c) => c.generationPass === 1)
  );

  const laneLabels = laneCandidates.map((c) => c.label);
  const guardMatches = GUARD_NEST_CLASS.filter((name) =>
    laneLabels.some((l) => l.toLowerCase() === name.toLowerCase())
  );
  assert(
    "business_brand lane generation GuardNest-class",
    guardMatches.length >= 6,
    `got ${guardMatches.length}: ${guardMatches.join(", ")}`
  );

  const seoLaneUsed = laneCandidates.some((c) => c.lane === "seo_exact_partial");
  assert(
    "business_brand does not use seo_exact_partial by default",
    !seoLaneUsed
  );

  const literalSlug = laneLabels.find((l) => l.toLowerCase().replace(/-/g, "") === "homesecuritysystem");
  assert(
    "business_brand rejects homesecuritysystem in lane output",
    !literalSlug
  );

  const enabled = getEnabledLanesForIntent(criteria);
  assert(
    "business_brand enabled lanes include premium_brandable",
    enabled.includes("premium_brandable")
  );
  assert(
    "business_brand enabled lanes include service_clear",
    enabled.includes("service_clear")
  );

  const laneDomains = generateLaneCandidateDomains(homeSecurityBrief);
  assert("generateLaneCandidateDomains returns domains", laneDomains.length > 0);
  assert(
    "all lane domains carry namingLane metadata",
    laneDomains.every((d) => Boolean(d.namingLane))
  );

  const primaryLabels = laneDomains.slice(0, 15).map((d) => d.domain.split(".")[0]);
  assert(
    "primary lane domains are not homesecuritysystem",
    !primaryLabels.some((l) => l.replace(/-/g, "") === "homesecuritysystem")
  );
}

const seoBrief: DomainBrief = mergeBrief({
  naming: "home security reviews and guides",
  buyingIntent: "seo_content",
  searchGoal: "seo_content",
  industry: "Home security",
  requirements: ["exact match"],
  tldPreference: "com",
});

const seoCriteria = extractNamingCriteria(seoBrief);
if (seoCriteria) {
  const seoLaneCandidates = runLanesForIntent(seoCriteria);
  assert(
    "seo_content uses seo_exact_partial lane",
    seoLaneCandidates.some((c) => c.lane === "seo_exact_partial")
  );
}

const legacyDomains = generateCandidateDomains(homeSecurityBrief);
assert("generateCandidateDomains still returns domains", legacyDomains.length > 0);

console.log("");
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
