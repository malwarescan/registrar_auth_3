import type { AvailabilityStatus, DomainCandidate } from "@/lib/types/domain";

export const BUYABLE_STATUSES: AvailabilityStatus[] = [
  "available",
  "premium_available",
  "marketplace_available",
];

export function canPurchaseDomain(domain: Pick<DomainCandidate, "availabilityStatus">): boolean {
  return BUYABLE_STATUSES.includes(domain.availabilityStatus);
}

export function isRecommendationEligible(
  domain: Pick<DomainCandidate, "availabilityStatus">
): boolean {
  return canPurchaseDomain(domain);
}

export function isBenchmarkOnly(domain: Pick<DomainCandidate, "availabilityStatus">): boolean {
  return domain.availabilityStatus === "taken" || domain.availabilityStatus === "benchmark_only";
}

export function isUnavailableStatus(status: AvailabilityStatus): boolean {
  return !BUYABLE_STATUSES.includes(status);
}

export function getAvailabilityLabel(status: AvailabilityStatus): string {
  if (status === "available") return "Available now";
  if (status === "premium_available") return "Premium listing";
  if (status === "marketplace_available") return "Marketplace listing";
  if (status === "taken") return "Taken";
  if (status === "benchmark_only") return "Benchmark only";
  if (status === "idea_only") return "Availability not checked";
  if (status === "unknown") return "Availability unknown";
  return "Availability check failed";
}

export function shouldShowPrice(candidate: DomainCandidate): boolean {
  if (candidate.availabilityStatus === "available") return true;
  return (
    candidate.availabilityStatus === "premium_available" ||
    candidate.availabilityStatus === "marketplace_available"
  );
}

