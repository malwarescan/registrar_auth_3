import type { BuyingIntent, DomainBrief } from "@/lib/types/domain-brief";
import { extractNamingCriteria } from "@/lib/intelligence/naming-criteria";
import {
  generateLabelsForIntent,
  rankLabelsForIntent,
} from "@/lib/intelligence/intent-strategies";
import { runLanesForIntent } from "@/lib/intelligence/naming-lanes";
import type { GenerationPass, NamingLane } from "@/lib/types/naming";

/** Domain string with lane metadata from multi-lane generation. */
export type LaneDomainCandidate = {
  domain: string;
  namingLane: NamingLane;
  generationPass: GenerationPass;
};

const MAX_DOMAIN_CHECKS = 120;
const MAX_LABELS = 45;

/** Generate lane-tagged full domain names (label + TLD) from brief criteria. */
export function generateLaneCandidateDomains(brief: DomainBrief): LaneDomainCandidate[] {
  const criteria = extractNamingCriteria(brief);
  if (!criteria) return [];

  const labeled = runLanesForIntent(criteria);
  if (labeled.length === 0) return [];

  const tlds = criteria.tldPreference;
  const domains: LaneDomainCandidate[] = [];
  const seen = new Set<string>();

  for (const candidate of labeled.slice(0, MAX_LABELS)) {
    for (const tld of tlds) {
      const domain = `${candidate.label.toLowerCase()}.${tld}`;
      const key = domain.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      domains.push({
        domain,
        namingLane: candidate.lane,
        generationPass: candidate.generationPass ?? 1,
      });
    }
  }

  return domains.slice(0, MAX_DOMAIN_CHECKS);
}

/** Legacy label-only path (unchanged behavior). */
export function generateCandidateLabels(brief: DomainBrief): string[] {
  const criteria = extractNamingCriteria(brief);
  if (!criteria) return [];

  const labels = generateLabelsForIntent(criteria);
  return rankLabelsForIntent(labels, criteria);
}

/** Legacy domain list — prefers lane-based generation, falls back to intent strategies. */
export function generateCandidateDomains(brief: DomainBrief): string[] {
  const laneDomains = generateLaneCandidateDomains(brief);
  if (laneDomains.length > 0) {
    return laneDomains.map((d) => d.domain);
  }

  const criteria = extractNamingCriteria(brief);
  if (!criteria) return [];

  const labels = rankLabelsForIntent(generateLabelsForIntent(criteria), criteria);
  const tlds = criteria.tldPreference;
  const domains: string[] = [];
  const seen = new Set<string>();

  for (const label of labels.slice(0, MAX_LABELS)) {
    for (const tld of tlds) {
      const domain = `${label.toLowerCase()}.${tld}`;
      if (!seen.has(domain)) {
        seen.add(domain);
        domains.push(domain);
      }
    }
  }

  return domains.slice(0, MAX_DOMAIN_CHECKS);
}

/** Map of domain → lane metadata for discover pipeline. */
export function getLaneMetadataMap(brief: DomainBrief): Map<string, LaneDomainCandidate> {
  const map = new Map<string, LaneDomainCandidate>();
  for (const entry of generateLaneCandidateDomains(brief)) {
    map.set(entry.domain.toLowerCase(), entry);
  }
  return map;
}

export function isBrandableIntent(intent: BuyingIntent | null): boolean {
  if (!intent) return true;
  return !["seo_content", "domain_investment"].includes(intent) && intent !== "brand_protection";
}
