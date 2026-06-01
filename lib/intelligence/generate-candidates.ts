import type { BuyingIntent, DomainBrief } from "@/lib/types/domain-brief";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import { extractNamingCriteria } from "@/lib/intelligence/naming-criteria";
import {
  generateLabelsForIntent,
  rankLabelsForIntent,
} from "@/lib/intelligence/intent-strategies";
import { parseDomain } from "@/lib/intelligence/parse-domain";

/** Generate domain label candidates from intent-specialized naming criteria. */
export function generateCandidateLabels(brief: DomainBrief): string[] {
  const criteria = extractNamingCriteria(brief);
  if (!criteria) return [];

  const labels = generateLabelsForIntent(criteria);
  return rankLabelsForIntent(labels, criteria);
}

/** Generate full domain names (label + TLD) from brief criteria. */
export function generateCandidateDomains(brief: DomainBrief): string[] {
  const criteria = extractNamingCriteria(brief);
  if (!criteria) return [];

  const labels = rankLabelsForIntent(generateLabelsForIntent(criteria), criteria);
  const tlds = criteria.tldPreference;
  const domains: string[] = [];
  const seen = new Set<string>();

  // Prefer .com for each top label, then alternate TLDs — maximizes unique names checked
  for (const label of labels.slice(0, 45)) {
    for (const tld of tlds) {
      const domain = `${label.toLowerCase()}.${tld}`;
      if (!seen.has(domain)) {
        seen.add(domain);
        domains.push(domain);
      }
    }
  }

  return domains.slice(0, 120);
}

export function isBrandableIntent(intent: BuyingIntent | null): boolean {
  if (!intent) return true;
  return !["seo_content", "domain_investment"].includes(intent) && intent !== "brand_protection";
}
