/**
 * Query literalness policy QA — no API calls.
 * Run: npm run qa:query-literalness
 */
import type { DomainBrief } from "../lib/types/domain-brief";
import { DEFAULT_BRIEF } from "../lib/types/domain-brief";
import { mergeBrief } from "../lib/search/brief-config";
import { extractNamingCriteria } from "../lib/intelligence/naming-criteria";
import { runLanesForIntent } from "../lib/intelligence/naming-lanes";
import {
  resolveQueryLiteralness,
  corpusHasHomeSecurityConcepts,
} from "../lib/intelligence/query-literalness";
import { generateKeywordRootCandidates } from "../lib/intelligence/keyword-root";

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

function brief(partial: Partial<DomainBrief>): DomainBrief {
  return mergeBrief({ ...DEFAULT_BRIEF, buyingIntent: "business_brand", ...partial });
}

function labelsFor(partial: Partial<DomainBrief>): string[] {
  const b = brief(partial);
  const criteria = extractNamingCriteria(b);
  if (!criteria) return [];
  return runLanesForIntent(criteria).map((c) => c.label.toLowerCase());
}

function hasMetaRoot(label: string): boolean {
  return label.includes("meta");
}

function hasSecurityStyle(label: string): boolean {
  return /guard|nest|haven|sentry|shield|homesentry|locksignal|securehaven|shieldnest/.test(label);
}

// --- Policy resolution ---
const metaInvestment = resolveQueryLiteralness(
  brief({ naming: "meta", buyingIntent: "domain_investment" })
);
assert("meta + investment → keyword_preferred", metaInvestment.queryLiteralness === "keyword_preferred");
assert("meta + investment → literal_seed mode", metaInvestment.investmentMode === "literal_seed");
assert("meta + investment uses literal root", metaInvestment.literalRoot === "meta");

const metaBrand = resolveQueryLiteralness(brief({ naming: "meta", buyingIntent: "business_brand" }));
assert("meta + business_brand → keyword_preferred", metaBrand.queryLiteralness === "keyword_preferred");

const metaSeo = resolveQueryLiteralness(brief({ naming: "meta", buyingIntent: "seo_content" }));
assert("meta + seo_content → exact_partial_required", metaSeo.queryLiteralness === "exact_partial_required");

const homeConstruction = resolveQueryLiteralness(
  brief({ naming: "home construction", buyingIntent: "domain_investment" })
);
assert(
  "home construction + investment → semantic/broad (not literal one-word seed)",
  homeConstruction.investmentMode === "broad_resale" || homeConstruction.queryLiteralness === "semantic_context"
);

// --- Case A: domain_investment + meta ---
const investmentLabels = labelsFor({ naming: "meta", buyingIntent: "domain_investment" });
const metaRootCount = investmentLabels.filter(hasMetaRoot).length;
assert(
  "Case A: investment meta includes meta-root names",
  metaRootCount >= 5,
  `found ${metaRootCount}: ${investmentLabels.slice(0, 12).join(", ")}`
);
assert(
  "Case A: no GuardNest-style without security brief",
  !investmentLabels.some((l) => hasSecurityStyle(l) && !hasMetaRoot(l)),
  investmentLabels.filter(hasSecurityStyle).join(", ")
);

const expectedMetaExamples = ["metaforge", "metagrid", "metasignal", "metastack", "metaflow"];
assert(
  "Case A: includes expected meta compound examples",
  expectedMetaExamples.some((ex) => investmentLabels.includes(ex)),
  investmentLabels.slice(0, 15).join(", ")
);

// --- Case B: business_brand + meta ---
const brandLabels = labelsFor({ naming: "meta", buyingIntent: "business_brand" });
assert(
  "Case B: brand meta includes meta-root names",
  brandLabels.filter(hasMetaRoot).length >= 4,
  brandLabels.slice(0, 12).join(", ")
);
assert(
  "Case B: no unrelated home/security names",
  !brandLabels.some((l) => hasSecurityStyle(l) && !hasMetaRoot(l)),
  brandLabels.filter(hasSecurityStyle).join(", ")
);

// --- Case C: seo_content + meta ---
const seoLabels = labelsFor({ naming: "meta", buyingIntent: "seo_content" });
const seoPartial = seoLabels.filter(
  (l) => l.includes("meta") || l.startsWith("meta") || l.includes("metaguide")
);
assert(
  "Case C: seo meta emphasizes exact/partial keyword names",
  seoPartial.length >= 3,
  seoLabels.slice(0, 12).join(", ")
);

// --- Case D: business_brand + home security (regression) ---
const securityLabels = labelsFor({
  naming: "home security system company",
  buyingIntent: "business_brand",
});
assert(
  "Case D: home security brief still allows GuardNest-class compounds",
  securityLabels.some((l) => hasSecurityStyle(l)),
  securityLabels.slice(0, 15).join(", ")
);
assert(
  "Case D: security corpus detected",
  corpusHasHomeSecurityConcepts("home security system company")
);

// --- Case E: domain_investment + home construction ---
const constructionLabels = labelsFor({
  naming: "home construction",
  buyingIntent: "domain_investment",
  industry: "construction",
});
const constructionRelated = constructionLabels.filter(
  (l) => /home|build|construct|house|dwell|nest|forge|grid/.test(l)
);
assert(
  "Case E: construction investment relates to category tokens",
  constructionRelated.length >= 3,
  constructionLabels.slice(0, 12).join(", ")
);

// --- keyword-root generator ---
const metaCriteria = extractNamingCriteria(brief({ naming: "meta", buyingIntent: "domain_investment" }));
assert("keyword-root generator runs for meta", Boolean(metaCriteria));
if (metaCriteria) {
  const roots = generateKeywordRootCandidates(metaCriteria).map((c) => c.label.toLowerCase());
  assert("keyword-root includes MetaForge", roots.includes("metaforge"));
  assert("keyword-root includes MetaStack", roots.includes("metastack"));
}

// --- brief quality ---
const weak = resolveQueryLiteralness(brief({ naming: "meta", buyingIntent: "domain_investment" }));
assert("single-word meta → weak or medium brief quality", weak.briefQuality === "weak" || weak.briefQuality === "medium");
assert("weak brief may include missing context warning", Boolean(weak.missingContextWarning));

const strong = resolveQueryLiteralness(
  brief({
    naming: "home security system company",
    buyingIntent: "business_brand",
    industry: "security",
    productService: "alarm monitoring",
  })
);
assert("rich brief → strong quality", strong.briefQuality === "strong");

console.log(`\nQuery literalness QA: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
