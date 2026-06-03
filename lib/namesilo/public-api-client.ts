import type { DomainAvailability } from "@/lib/namesilo/pricing";
import { parsePrice } from "@/lib/namesilo/pricing";

export type { DomainAvailability } from "@/lib/namesilo/pricing";

const SANDBOX_BASE = "https://sandbox.namesilo.com/api";
const PROD_BASE = "https://www.namesilo.com/api";

const GET_PRICES_METADATA_KEYS = new Set(["code", "detail", "tld"]);

function getBaseUrl(): string {
  return process.env.NAMESILO_API_SANDBOX === "true" ? SANDBOX_BASE : PROD_BASE;
}

function getApiKey(): string | undefined {
  return process.env.NAMESILO_API_KEY;
}

type NameSiloReply = {
  code: string;
  detail: string;
  available?: unknown;
  unavailable?: unknown;
  invalid?: unknown;
  tld?: unknown;
  [key: string]: unknown;
};

export async function namesiloRequest<T extends NameSiloReply>(
  operation: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const key = getApiKey();
  if (!key) return null;

  const url = new URL(`${getBaseUrl()}/${operation}`);
  url.searchParams.set("version", "1");
  url.searchParams.set("type", "json");
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.reply as T;
  } catch {
    return null;
  }
}

function extractDomainName(entry: unknown): string | null {
  if (typeof entry === "string") return entry.trim() || null;
  if (!entry || typeof entry !== "object") return null;

  const obj = entry as Record<string, unknown>;
  if (typeof obj.domain === "string") return obj.domain;
  if (typeof obj.name === "string") return obj.name;
  if (typeof obj["#text"] === "string") return obj["#text"];

  const keys = Object.keys(obj).filter((k) => !k.startsWith("@") && k !== "price" && k !== "premium");
  if (keys.length === 1 && typeof obj[keys[0]] !== "object") {
    return keys[0];
  }

  return null;
}

function collectDomainEntries(section: unknown): unknown[] {
  if (!section) return [];
  if (Array.isArray(section)) return section;
  if (typeof section !== "object") return [];

  const obj = section as Record<string, unknown>;
  const domainNode = obj.domain;
  if (Array.isArray(domainNode)) return domainNode;
  if (domainNode !== undefined) return [domainNode];
  return Object.values(obj);
}

function parseTldRegistrationPrice(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const registration = (data as Record<string, unknown>).registration;
  return parsePrice(registration);
}

function parseAvailabilitySection(
  section: unknown,
  status: boolean,
  result: Record<string, DomainAvailability>
): void {
  for (const entry of collectDomainEntries(section)) {
    const domain = extractDomainName(entry);
    if (!domain) continue;

    const price =
      status && entry && typeof entry === "object"
        ? parsePrice((entry as Record<string, unknown>).price)
        : null;

    result[domain.toLowerCase()] = { available: status, price };
  }
}

function emptyAvailability(domains: string[]): Record<string, DomainAvailability> {
  const result: Record<string, DomainAvailability> = {};
  for (const d of domains) {
    result[d] = { available: false, price: null };
  }
  return result;
}

function parseAvailabilityReply(
  reply: NameSiloReply | null,
  domains: string[]
): Record<string, DomainAvailability> {
  const byLower: Record<string, DomainAvailability> = {};
  for (const d of domains) {
    byLower[d.toLowerCase()] = { available: false, price: null };
  }

  if (!reply) return byLower;

  parseAvailabilitySection(reply.available, true, byLower);
  parseAvailabilitySection(reply.unavailable, false, byLower);
  parseAvailabilitySection(reply.invalid, false, byLower);

  if (reply.available && typeof reply.available === "object" && !Array.isArray(reply.available)) {
    const flat = reply.available as Record<string, unknown>;
    if (!("domain" in flat)) {
      for (const [domain, status] of Object.entries(flat)) {
        if (typeof status === "string") {
          byLower[domain.toLowerCase()] = {
            available: status.toLowerCase() === "available",
            price: null,
          };
        }
      }
    }
  }

  const normalized: Record<string, DomainAvailability> = {};
  for (const d of domains) {
    normalized[d] = byLower[d.toLowerCase()] ?? { available: false, price: null };
  }
  return normalized;
}

export async function checkRegisterAvailability(
  domains: string[]
): Promise<Record<string, DomainAvailability>> {
  if (domains.length === 0) return {};

  try {
    const reply = await namesiloRequest<NameSiloReply>("checkRegisterAvailability", {
      domains: domains.join(","),
    });
    return parseAvailabilityReply(reply, domains);
  } catch (err) {
    console.warn("[namesilo] checkRegisterAvailability failed:", err);
    return emptyAvailability(domains);
  }
}

export async function getTldPrices(): Promise<Record<string, number>> {
  const reply = await namesiloRequest<NameSiloReply>("getPrices");
  const map: Record<string, number> = {};
  if (!reply || reply.code !== "300") return map;

  if (reply.tld && typeof reply.tld === "object") {
    for (const [tld, data] of Object.entries(reply.tld as Record<string, unknown>)) {
      const price = parseTldRegistrationPrice(data);
      if (price != null) map[tld.toLowerCase()] = price;
    }
  }

  for (const [key, value] of Object.entries(reply)) {
    if (GET_PRICES_METADATA_KEYS.has(key)) continue;
    const price = parseTldRegistrationPrice(value);
    if (price != null) map[key.toLowerCase()] = price;
  }

  return map;
}

export async function getRegistrationPrice(tld: string): Promise<number | null> {
  const prices = await getTldPrices();
  const key = tld.replace(".", "").toLowerCase();
  return prices[key] ?? null;
}

type AuctionListing = {
  domain: string;
  price: number;
  buyNow?: number;
};

function extractAuctionDomain(entry: unknown): string | null {
  if (typeof entry === "string") return entry.trim().toLowerCase() || null;
  if (!entry || typeof entry !== "object") return null;
  const obj = entry as Record<string, unknown>;
  for (const key of ["domain", "domainName", "name"]) {
    if (typeof obj[key] === "string") return (obj[key] as string).trim().toLowerCase();
  }
  return extractDomainName(entry)?.toLowerCase() ?? null;
}

function collectAuctionEntries(reply: NameSiloReply | null): unknown[] {
  if (!reply || reply.code !== "300") return [];
  for (const key of ["auctions", "auction", "domains", "domain"]) {
    const section = reply[key];
    if (!section) continue;
    if (Array.isArray(section)) return section;
    if (typeof section === "object") {
      const obj = section as Record<string, unknown>;
      const nested = obj.auction ?? obj.domain;
      if (Array.isArray(nested)) return nested;
      if (nested !== undefined) return [nested];
      return Object.values(obj);
    }
  }
  return [];
}

/** Search NameSilo marketplace auctions via the same API (listAuctions). */
export async function searchAuctionListings(
  query: string,
  options?: { pageSize?: number; maxPrice?: number }
): Promise<AuctionListing[]> {
  const keyword = query.trim().split(/\s+/)[0];
  if (!keyword || keyword.length < 3) return [];

  const reply = await namesiloRequest<NameSiloReply>("listAuctions", {
    domainName: keyword,
    page: "1",
    pageSize: String(options?.pageSize ?? 20),
  });

  if (!reply || reply.code === "107") return [];

  const listings: AuctionListing[] = [];
  for (const entry of collectAuctionEntries(reply)) {
    const domain = extractAuctionDomain(entry);
    if (!domain || !domain.includes(".")) continue;

    const obj = typeof entry === "object" && entry ? (entry as Record<string, unknown>) : {};
    const price =
      parsePrice(obj.buyNow) ??
      parsePrice(obj.currentBid) ??
      parsePrice(obj.price) ??
      parsePrice(obj.openingBid);

    if (price == null) continue;
    if (options?.maxPrice && price > options.maxPrice) continue;
    listings.push({ domain, price, buyNow: parsePrice(obj.buyNow) ?? undefined });
  }

  return listings;
}

export { getBuyUrl } from "./urls";
