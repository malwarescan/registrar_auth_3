import type { AvailabilityStatus } from "@/lib/types/domain";

export type DomainAvailability = {
  available: boolean;
  price: number | null;
};

export function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

export function resolveRegistrationPrice(
  domain: string,
  availability: DomainAvailability | undefined,
  tldPrices: Record<string, number>
): number | null {
  if (availability?.price != null) return availability.price;

  const tld = domain.split(".").pop()?.toLowerCase() ?? "com";
  return tldPrices[tld] ?? null;
}

export function isPremiumRegistrationPrice(
  price: number,
  tld: string,
  tldPrices: Record<string, number>
): boolean {
  const standard = tldPrices[tld.toLowerCase()];
  if (standard != null) return price > standard + 0.01;
  return price > 20;
}

export function resolveRegistrationAvailabilityStatus(
  available: boolean,
  price: number | null,
  tld: string,
  tldPrices: Record<string, number>,
  apiConfigured: boolean,
  hadApiError: boolean
): AvailabilityStatus {
  if (hadApiError) return apiConfigured ? "api_error" : "idea_only";
  if (!apiConfigured) return "idea_only";
  if (!available) return "taken";
  if (price != null && isPremiumRegistrationPrice(price, tld, tldPrices)) {
    return "premium_available";
  }
  if (price == null) return "unknown";
  return "available";
}
