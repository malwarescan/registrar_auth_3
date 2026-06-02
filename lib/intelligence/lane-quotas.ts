import type { BuyingIntent } from "@/lib/types/domain-brief";
import type { LaneQuotaConfig, LaneQuotaMap, NamingLane } from "@/lib/types/naming";
import type { LiteralnessPolicy } from "@/lib/intelligence/query-literalness";
import { usesLiteralRoot } from "@/lib/intelligence/query-literalness";

export type LaneQuotaConstraints = {
  preferExactMatch: boolean;
  preferKeywordSlug: boolean;
  isLocalContext: boolean;
};

export const DEFAULT_LANE_QUOTAS: LaneQuotaConfig = {
  business_brand: {
    premium_brandable: 0.4,
    service_clear: 0.35,
    saas_app: 0.1,
    seo_exact_partial: 0.05,
    short_punchy: 0.1,
  },
  personal_brand: {
    premium_brandable: 0.2,
    service_clear: 0.1,
    defensive: 0.1,
    short_punchy: 0.3,
    premium_upgrade: 0.3,
  },
  local_service: {
    premium_brandable: 0.25,
    service_clear: 0.3,
    local_service: 0.35,
    seo_exact_partial: 0.05,
    short_punchy: 0.05,
  },
  saas_app: {
    premium_brandable: 0.35,
    service_clear: 0.15,
    saas_app: 0.35,
    short_punchy: 0.15,
  },
  seo_content: {
    premium_brandable: 0.05,
    service_clear: 0.05,
    local_service: 0.05,
    seo_exact_partial: 0.7,
    investor_resale: 0.05,
    short_punchy: 0.1,
  },
  domain_investment: {
    premium_brandable: 0.25,
    service_clear: 0.15,
    seo_exact_partial: 0.15,
    investor_resale: 0.3,
    short_punchy: 0.25,
  },
  brand_protection: {
    defensive: 0.8,
    short_punchy: 0.2,
  },
  premium_upgrade: {
    premium_brandable: 0.3,
    service_clear: 0.2,
    defensive: 0.1,
    short_punchy: 0.1,
    premium_upgrade: 0.3,
  },
  campaign_landing: {
    premium_brandable: 0.2,
    service_clear: 0.1,
    saas_app: 0.1,
    seo_exact_partial: 0.05,
    short_punchy: 0.55,
  },
  ecommerce_store: {
    premium_brandable: 0.35,
    service_clear: 0.3,
    seo_exact_partial: 0.1,
    short_punchy: 0.15,
  },
};

const KEYWORD_LITERAL_INVESTMENT: LaneQuotaMap = {
  investor_resale: 0.35,
  short_punchy: 0.2,
  premium_brandable: 0.2,
  keyword_root: 0.2,
  service_clear: 0.05,
};

const KEYWORD_LITERAL_BRAND: LaneQuotaMap = {
  premium_brandable: 0.4,
  service_clear: 0.25,
  short_punchy: 0.2,
  keyword_root: 0.15,
};

const SEO_LANE: NamingLane = "seo_exact_partial";

function seoExplicitlyAllowed(
  constraints: LaneQuotaConstraints,
  intent?: BuyingIntent,
  literalness?: LiteralnessPolicy["queryLiteralness"]
): boolean {
  if (intent === "seo_content") return true;
  if (literalness === "exact_partial_required" || literalness === "keyword_required") {
    return true;
  }
  return constraints.preferExactMatch || constraints.preferKeywordSlug;
}

export function normalizeLaneQuotas(
  quotas: LaneQuotaMap,
  constraints: LaneQuotaConstraints,
  intent?: BuyingIntent,
  literalness?: LiteralnessPolicy["queryLiteralness"]
): LaneQuotaMap {
  if (seoExplicitlyAllowed(constraints, intent, literalness)) {
    return { ...quotas };
  }

  // Keep keyword_root lane when present — unrelated to SEO slug suppression.
  const keywordRootShare = quotas.keyword_root ?? 0;

  const normalized = { ...quotas };
  const seoShare = normalized[SEO_LANE] ?? 0;
  delete normalized[SEO_LANE];

  if (seoShare <= 0) {
    if (keywordRootShare > 0) {
      normalized.keyword_root = keywordRootShare;
    }
    return normalized;
  }

  normalized.premium_brandable = (normalized.premium_brandable ?? 0) + seoShare * 0.6;
  normalized.service_clear = (normalized.service_clear ?? 0) + seoShare * 0.4;
  if (keywordRootShare > 0) {
    normalized.keyword_root = keywordRootShare;
  }

  return normalized;
}

export function getLaneQuotasForIntent(
  intent: BuyingIntent,
  constraints: LaneQuotaConstraints,
  literalness?: LiteralnessPolicy
): LaneQuotaMap {
  const keywordAnchored =
    literalness &&
    usesLiteralRoot(literalness) &&
    (literalness.queryLiteralness === "keyword_preferred" ||
      literalness.queryLiteralness === "keyword_required");

  let base: LaneQuotaMap;
  if (keywordAnchored && intent === "domain_investment" && literalness.investmentMode === "literal_seed") {
    base = { ...KEYWORD_LITERAL_INVESTMENT };
  } else if (keywordAnchored && intent === "business_brand") {
    base = { ...KEYWORD_LITERAL_BRAND };
  } else if (keywordAnchored && intent === "saas_app") {
    base = {
      premium_brandable: 0.35,
      saas_app: 0.3,
      keyword_root: 0.2,
      short_punchy: 0.15,
    };
  } else {
    base = { ...DEFAULT_LANE_QUOTAS[intent] };
  }

  let quotas = normalizeLaneQuotas(base, constraints, intent, literalness?.queryLiteralness);

  if (constraints.isLocalContext && intent !== "local_service" && intent !== "seo_content") {
    const localShare = 0.15;
    quotas = {
      ...quotas,
      local_service: (quotas.local_service ?? 0) + localShare,
      premium_brandable: Math.max(0, (quotas.premium_brandable ?? 0) - localShare * 0.6),
      service_clear: Math.max(0, (quotas.service_clear ?? 0) - localShare * 0.4),
    };
  }

  return quotas;
}

export function allocateLabelBudget(
  quotas: LaneQuotaMap,
  totalLabels: number
): Record<NamingLane, number> {
  const entries = Object.entries(quotas) as [NamingLane, number][];
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  const result = {} as Record<NamingLane, number>;
  let assigned = 0;

  for (let i = 0; i < entries.length; i++) {
    const [lane, weight] = entries[i];
    if (i === entries.length - 1) {
      result[lane] = Math.max(0, totalLabels - assigned);
    } else {
      const count = totalWeight > 0 ? Math.round((weight / totalWeight) * totalLabels) : 0;
      result[lane] = count;
      assigned += count;
    }
  }

  return result;
}
