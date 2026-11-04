/**
 * NameSilo price QA: rendered NameSilo prices must equal data/namesilo-prices.json.
 * Run: npm run qa:namesilo-prices
 */
import { renderToStaticMarkup } from "react-dom/server";
import snapshot from "../data/namesilo-prices.json";
import { getSeedCandidates, getSeedDomain } from "../lib/intelligence/seed-data";
import { snapshotRegistrationPrice, snapshotTldPrices } from "../lib/namesilo/price-snapshot";
import { getTldPrices } from "../lib/namesilo/public-api-client";
import { DomainCard } from "../components/search/DomainCard";
import { ShortlistProvider } from "../lib/shortlist/shortlist-context";

let passed = 0;
let failed = 0;
function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed += 1;
  } else {
    console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
    failed += 1;
  }
}

async function main() {
  assert("snapshot source", snapshot.source === "NameSilo API getPrices");
  assert("snapshot .com register 19.99", snapshot.prices.com.register === "19.99");
  assert("snapshot .com renew 19.99", snapshot.prices.com.renew === "19.99");

  // Every registration-priced demo candidate uses the snapshot price and date.
  const regs = getSeedCandidates().filter((c) => c.priceType === "registration");
  assert("demo has a registration-priced candidate", regs.length > 0);
  for (const c of regs) {
    const tld = c.domain.split(".").pop()!.toLowerCase();
    assert(`${c.domain} price = snapshot`, c.price === snapshotRegistrationPrice(tld), `${c.price}`);
    assert(`${c.domain} checked = snapshot`, c.priceCheckedAt === snapshot.checked);

    // Rendered card shows the snapshot price and the checked label.
    const html = renderToStaticMarkup(
      <ShortlistProvider>
        <DomainCard candidate={c} />
      </ShortlistProvider>
    );
    const expected = `$${parseFloat(snapshot.prices[tld as keyof typeof snapshot.prices].register)}`;
    assert(`${c.domain} rendered price ${expected}`, html.includes(`${expected}<`), html.slice(0, 300));
    assert(
      `${c.domain} rendered label`,
      html.includes(`NameSilo price, checked ${snapshot.checked}`)
    );
    const row = snapshot.prices[tld as keyof typeof snapshot.prices];
    if (row.renew !== row.register) {
      assert(`${c.domain} rendered renewal $${row.renew}`, html.includes(`renews at $${row.renew}/yr`));
    }
  }

  const seed = getSeedDomain("EcoHome.tech");
  assert("domain report uses snapshot", seed?.price === snapshotRegistrationPrice("tech"));

  // With no API key, the TLD price map is the snapshot.
  const savedKey = process.env.NAMESILO_API_KEY;
  delete process.env.NAMESILO_API_KEY;
  const map = await getTldPrices();
  if (savedKey !== undefined) process.env.NAMESILO_API_KEY = savedKey;
  assert(
    "getTldPrices falls back to snapshot",
    JSON.stringify(map) === JSON.stringify(snapshotTldPrices()) && map.com === 19.99
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
