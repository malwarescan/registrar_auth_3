import type { NamingLane } from "@/lib/types/naming";

const LANE_LABELS: Record<NamingLane, string> = {
  premium_brandable: "Premium brandable",
  service_clear: "Service-clear",
  local_service: "Local service",
  saas_app: "SaaS / app",
  seo_exact_partial: "SEO fit",
  investor_resale: "Investor / resale",
  defensive: "Defensive",
  short_punchy: "Short / punchy",
  premium_upgrade: "Premium upgrade",
};

export function formatNamingLane(lane: NamingLane): string {
  return LANE_LABELS[lane] ?? lane;
}
