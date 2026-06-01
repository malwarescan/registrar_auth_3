import type { BuyingIntent } from "@/lib/types/domain-brief";

/** Naming lane used during multi-lane domain generation. */
export type NamingLane =
  | "premium_brandable"
  | "service_clear"
  | "local_service"
  | "saas_app"
  | "seo_exact_partial"
  | "investor_resale"
  | "defensive"
  | "short_punchy"
  | "premium_upgrade";

/** 1 = initial generation pass, 2 = availability-aware regeneration / refinement. */
export type GenerationPass = 1 | 2;

/** Label candidate before TLD expansion, tagged with generation metadata. */
export type LabeledCandidate = {
  label: string;
  lane: NamingLane;
  roots?: string[];
  template?: string;
  generationPass?: GenerationPass;
  seedDomain?: string;
  rejectionReasons?: string[];
};

/** Fraction (0–1) of label budget allocated to a lane. */
export type LaneQuota = number;

export type LaneQuotaMap = Partial<Record<NamingLane, LaneQuota>>;

export type LaneQuotaConfig = Record<BuyingIntent, LaneQuotaMap>;

export const ALL_NAMING_LANES: NamingLane[] = [
  "premium_brandable",
  "service_clear",
  "local_service",
  "saas_app",
  "seo_exact_partial",
  "investor_resale",
  "defensive",
  "short_punchy",
  "premium_upgrade",
];
