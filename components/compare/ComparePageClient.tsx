"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TradeoffMap } from "@/components/compare/TradeoffMap";
import { ComparisonMatrix } from "@/components/compare/ComparisonMatrix";
import { DecisionSummary } from "@/components/compare/DecisionSummary";
import { Button } from "@/components/ui/Button";
import type { CompareResponse } from "@/lib/types/domain";
import { useShortlistContext } from "@/lib/shortlist/shortlist-context";
import { slugToDomain } from "@/lib/shortlist/use-shortlist";
import { getBuyUrl } from "@/lib/namesilo/urls";
import { canPurchaseDomain } from "@/lib/domains/availability";

export const EXAMPLE_HREF =
  "/compare?domains=brightnest-com,smartecohome-com,ecohometech-net&q=smart%20eco%20home";

export function ComparePageClient() {
  const searchParams = useSearchParams();
  const { shortlist, add } = useShortlistContext();
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  useEffect(() => {
    async function load() {
      const paramDomains = searchParams.get("domains")?.split(",").filter(Boolean) ?? [];
      const domains =
        paramDomains.length >= 2
          ? paramDomains.map(slugToDomain)
          : shortlist.slice(0, 3).map((c) => c.domain);

      if (domains.length < 2) {
        setLoading(false);
        return;
      }

      const query = searchParams.get("q") ?? "Eco Home Tech";
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains, query }),
      });
      if (res.ok) {
        const json = (await res.json()) as CompareResponse;
        setData(json);
        setSelectedDomain(json.decisions[0]?.domain ?? domains[0]);
      }
      setLoading(false);
    }
    load();
  }, [searchParams, shortlist]);

  const selected = data?.domains.find((d) => d.domain === selectedDomain);

  return (
    <section aria-label="Your comparison" className="space-y-5">
        {loading && (
          <p className="text-sm text-[var(--on-surface-variant)]">Loading comparison...</p>
        )}

        {!loading && !data && (
          <p className="text-sm text-[var(--on-surface-variant)]">
            Save at least two domains to your shortlist from a search, then come back here.{" "}
            <Link href={EXAMPLE_HREF} className="font-medium text-[var(--theme-primary)] underline">
              Or open the example comparison
            </Link>
            .
          </p>
        )}

        {data && (
          <>
            <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
              <TradeoffMap points={data.tradeoffPoints} summary={data.summary} />
              <ComparisonMatrix
                domains={data.domains.map((d) => d.domain)}
                rankings={data.rankings}
              />
            </div>
            <DecisionSummary decisions={data.decisions} />
            <div className="flex flex-col gap-2 pt-2 sm:flex-row lg:max-w-md">
              {selected && (
                canPurchaseDomain(selected) ? (
                  <a
                    href={getBuyUrl(selected.domain, selected.priceType)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">Buy Selected</Button>
                  </a>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Not purchasable
                  </Button>
                )
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => data.domains.forEach((d) => add(d))}
              >
                Save to Shortlist
              </Button>
            </div>
          </>
        )}
    </section>
  );
}
