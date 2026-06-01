"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { TradeoffMap } from "@/components/compare/TradeoffMap";
import { ComparisonMatrix } from "@/components/compare/ComparisonMatrix";
import { DecisionSummary } from "@/components/compare/DecisionSummary";
import { Button } from "@/components/ui/Button";
import type { CompareResponse } from "@/lib/types/domain";
import { useShortlistContext } from "@/lib/shortlist/shortlist-context";
import { slugToDomain } from "@/lib/shortlist/use-shortlist";
import { getBuyUrl } from "@/lib/namesilo/urls";
import { canPurchaseDomain } from "@/lib/domains/availability";

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
    <PageShell headerTitle="Competitive Domain Analysis" backHref="/">
      <div className="space-y-5">
        <p className="text-sm text-[var(--on-surface-variant)]">
          NameSilo Marketplace with integrated domain signal intelligence for brand, SEO, and AI
          visibility.
        </p>

        {loading && (
          <p className="text-sm text-[var(--on-surface-variant)]">Loading comparison...</p>
        )}

        {!loading && !data && (
          <p className="text-sm text-[var(--on-surface-variant)]">
            Add at least 2 domains to your shortlist or pass domains via URL to compare.
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
      </div>
    </PageShell>
  );
}
