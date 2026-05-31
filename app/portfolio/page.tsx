"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useShortlistContext } from "@/lib/shortlist/shortlist-context";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";

export default function PortfolioPage() {
  const { shortlist, remove, clear, loaded } = useShortlistContext();

  const compareHref =
    shortlist.length >= 2
      ? `/compare?domains=${shortlist.slice(0, 3).map((c) => domainToSlug(c.domain)).join(",")}`
      : "/compare";

  return (
    <PageShell headerTitle="Portfolio">
      <div className="space-y-4">
        <p className="text-sm text-[var(--on-surface-variant)]">
          Your saved domains for comparison and purchase decisions.
        </p>

        {!loaded && <p className="text-sm">Loading...</p>}

        {loaded && shortlist.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--on-surface-variant)]">
              No domains saved yet. Analyze a search and add domains to your shortlist.
            </p>
            <Link href="/" className="mt-3 inline-block">
              <Button size="sm">Start Searching</Button>
            </Link>
          </Card>
        )}

        {shortlist.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {shortlist.map((c) => (
              <Card key={c.domain} padding="sm" className="flex items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/domain/${domainToSlug(c.domain)}`}
                    className="font-semibold text-[var(--on-surface)] hover:text-[var(--secondary)]"
                  >
                    {c.domain}
                  </Link>
                  <p className="text-sm tabular-nums text-[var(--on-surface-variant)]">
                    ${c.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(c.domain)}>
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}

        {shortlist.length > 0 && (
          <div className="flex gap-2 lg:max-w-md">
            <Link href={compareHref} className="flex-1">
              <Button className="w-full">Compare ({shortlist.length})</Button>
            </Link>
            <Button variant="outline" onClick={clear}>
              Clear
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
