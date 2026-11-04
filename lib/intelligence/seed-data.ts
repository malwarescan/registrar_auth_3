import type { DomainCandidate } from "@/lib/types/domain";
import { scoreDomain } from "./score-domain";
import { NAMESILO_PRICES_CHECKED, snapshotRegistrationPrice } from "@/lib/namesilo/price-snapshot";

const DEMO_QUERY = "Eco Home Tech";

const RAW_DOMAINS: Array<{
  domain: string;
  price: number;
  priceType: "registration" | "marketplace";
  available: boolean;
}> = [
  { domain: "BrightNest.com", price: 499, priceType: "marketplace", available: true },
  { domain: "EcoHomeTech.net", price: 399, priceType: "marketplace", available: true },
  { domain: "SmartEcoHome.com", price: 199, priceType: "marketplace", available: true },
  // Registration price comes from the NameSilo snapshot, never typed in here.
  { domain: "EcoHome.tech", price: snapshotRegistrationPrice("tech") ?? 0, priceType: "registration", available: true },
  { domain: "EcoHomeTech.com", price: 899, priceType: "marketplace", available: true },
  { domain: "GreenNest.io", price: 299, priceType: "marketplace", available: true },
  { domain: "GreenTechDwelling.com", price: 349, priceType: "marketplace", available: true },
];

export function getSeedCandidates(query = DEMO_QUERY): DomainCandidate[] {
  return RAW_DOMAINS.map((d) => withCheckedDate(d.priceType, scoreDomain(d.domain, query, d.price, d.priceType, d.available)));
}

export function getSeedDomain(domain: string, query = DEMO_QUERY): DomainCandidate | null {
  const normalized = domain.toLowerCase();
  const raw = RAW_DOMAINS.find((d) => d.domain.toLowerCase() === normalized);
  if (!raw) return null;
  return withCheckedDate(raw.priceType, scoreDomain(raw.domain, query, raw.price, raw.priceType, raw.available));
}

function withCheckedDate(priceType: "registration" | "marketplace", c: DomainCandidate): DomainCandidate {
  return priceType === "registration" ? { ...c, priceCheckedAt: NAMESILO_PRICES_CHECKED } : c;
}

export const DEMO_QUERY_EXPORT = DEMO_QUERY;
