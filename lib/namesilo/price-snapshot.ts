import snapshot from "@/data/namesilo-prices.json";

/**
 * Committed snapshot of NameSilo's official prices (NameSilo API getPrices).
 * Refresh with `npm run prices:namesilo` (needs NAMESILO_API_KEY in the environment).
 * Live searches use the live API when NAMESILO_API_KEY is set; this snapshot is the
 * fallback when the key is missing or the live getPrices call fails, and the source
 * for the demo search.
 */
export type NameSiloTldPrice = { register: string; renew: string; transfer: string };

export type NameSiloPriceSnapshot = {
  source: string;
  checked: string;
  prices: Record<string, NameSiloTldPrice>;
};

export const NAMESILO_PRICES = snapshot as NameSiloPriceSnapshot;
export const NAMESILO_PRICES_CHECKED = NAMESILO_PRICES.checked;

function normalizeTld(tld: string): string {
  return tld.replace(/^\./, "").toLowerCase();
}

/** NameSilo first-year registration price (USD) from the snapshot, or null if not in it. */
export function snapshotRegistrationPrice(tld: string): number | null {
  const row = NAMESILO_PRICES.prices[normalizeTld(tld)];
  if (!row) return null;
  const n = parseFloat(row.register);
  return Number.isFinite(n) ? n : null;
}

/** TLD -> registration price map, same shape as getTldPrices(). */
export function snapshotTldPrices(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const tld of Object.keys(NAMESILO_PRICES.prices)) {
    const price = snapshotRegistrationPrice(tld);
    if (price != null) map[tld] = price;
  }
  return map;
}

export function namesiloPriceLabel(checked: string): string {
  return `NameSilo price, checked ${checked}`;
}
