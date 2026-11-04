/**
 * Rewrites data/namesilo-prices.json from NameSilo's official getPrices API.
 * Run: NAMESILO_API_KEY=... npm run prices:namesilo
 * Only the TLDs already in the snapshot are refreshed. On any failure the
 * existing snapshot is left untouched and the script exits non-zero.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FILE = join(process.cwd(), "data", "namesilo-prices.json");

async function main() {
  const key = process.env.NAMESILO_API_KEY;
  if (!key) {
    console.error("NAMESILO_API_KEY is not set; snapshot left unchanged.");
    process.exit(1);
  }
  const current = JSON.parse(readFileSync(FILE, "utf8"));
  const url = new URL("https://www.namesilo.com/api/getPrices");
  url.searchParams.set("version", "1");
  url.searchParams.set("type", "json");
  url.searchParams.set("key", key);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`getPrices HTTP ${res.status}`);
  const reply = (await res.json())?.reply;
  if (!reply || String(reply.code) !== "300") {
    throw new Error(`getPrices failed: ${reply?.code} ${reply?.detail}`);
  }

  const prices: Record<string, { register: string; renew: string; transfer: string }> = {};
  for (const tld of Object.keys(current.prices)) {
    const row = reply[tld];
    if (!row?.registration || !row?.renew || !row?.transfer) {
      throw new Error(`getPrices reply has no complete row for .${tld}`);
    }
    prices[tld] = {
      register: String(row.registration),
      renew: String(row.renew),
      transfer: String(row.transfer),
    };
  }

  const next = {
    source: "NameSilo API getPrices",
    checked: new Date().toISOString().slice(0, 10),
    prices,
  };
  writeFileSync(FILE, JSON.stringify(next, null, 2) + "\n");
  console.log(`Wrote ${Object.keys(prices).length} TLDs to ${FILE} (checked ${next.checked}).`);
}

main().catch((err) => {
  console.error(`[prices:namesilo] ${err instanceof Error ? err.message : err}; snapshot left unchanged.`);
  process.exit(1);
});
