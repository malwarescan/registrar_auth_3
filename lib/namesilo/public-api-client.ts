const SANDBOX_BASE = "https://sandbox.namesilo.com/api";
const PROD_BASE = "https://www.namesilo.com/api";

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
  [key: string]: unknown;
};

async function namesiloRequest<T extends NameSiloReply>(
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

  // JSON converted from XML sometimes uses the domain as a single key
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

function parseAvailabilitySection(
  section: unknown,
  status: boolean,
  result: Record<string, boolean>
): void {
  for (const entry of collectDomainEntries(section)) {
    const domain = extractDomainName(entry);
    if (domain) {
      result[domain.toLowerCase()] = status;
    }
  }
}

function parseAvailabilityReply(
  reply: NameSiloReply | null,
  domains: string[]
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const d of domains) {
    result[d] = true;
  }

  if (!reply) return result;

  parseAvailabilitySection(reply.available, true, result);
  parseAvailabilitySection(reply.unavailable, false, result);
  parseAvailabilitySection(reply.invalid, false, result);

  // Legacy flat object: { "example.com": "available" }
  if (reply.available && typeof reply.available === "object" && !Array.isArray(reply.available)) {
    const flat = reply.available as Record<string, unknown>;
    if (!("domain" in flat)) {
      for (const [domain, status] of Object.entries(flat)) {
        if (typeof status === "string") {
          result[domain.toLowerCase()] = status.toLowerCase() === "available";
        }
      }
    }
  }

  // Normalize keys back to original domain casing from request
  const normalized: Record<string, boolean> = {};
  for (const d of domains) {
    normalized[d] = result[d.toLowerCase()] ?? true;
  }
  return normalized;
}

export async function checkRegisterAvailability(
  domains: string[]
): Promise<Record<string, boolean>> {
  if (domains.length === 0) return {};

  try {
    const reply = await namesiloRequest<NameSiloReply>("checkRegisterAvailability", {
      domains: domains.join(","),
    });
    return parseAvailabilityReply(reply, domains);
  } catch (err) {
    console.warn("[namesilo] checkRegisterAvailability failed:", err);
    const fallback: Record<string, boolean> = {};
    for (const d of domains) fallback[d] = true;
    return fallback;
  }
}

export async function getTldPrices(): Promise<Record<string, number>> {
  const reply = await namesiloRequest<NameSiloReply & { tld?: Record<string, { registration?: string }> }>(
    "getPrices"
  );
  const map: Record<string, number> = {};
  if (!reply?.tld) return map;
  for (const [tld, data] of Object.entries(reply.tld)) {
    if (data?.registration) map[tld] = parseFloat(data.registration);
  }
  return map;
}

export async function getRegistrationPrice(tld: string): Promise<number | null> {
  const prices = await getTldPrices();
  const key = tld.replace(".", "");
  return prices[key] ?? null;
}

export { getBuyUrl } from "./urls";
