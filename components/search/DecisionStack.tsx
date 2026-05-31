"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { DomainCandidate } from "@/lib/types/domain";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";

type DecisionStackProps = {
  brand: DomainCandidate;
  seo: DomainCandidate;
  ai: DomainCandidate;
  layout?: "scroll" | "grid";
};

function StackCard({ label, candidate }: { label: string; candidate: DomainCandidate }) {
  return (
    <Link href={`/domain/${domainToSlug(candidate.domain)}`}>
      <Card className="h-full min-w-[160px] shrink-0 hover:border-[var(--secondary)] lg:min-w-0" padding="sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
          {label}
        </p>
        <p className="mt-1 font-semibold text-[var(--on-surface)]">{candidate.domain}</p>
        <p className="mt-1 text-lg font-bold tabular-nums text-[var(--on-surface)]">
          ${candidate.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
          Refined, data-driven summaries for {candidate.domain.split(".")[0]}.
        </p>
      </Card>
    </Link>
  );
}

export function DecisionStack({ brand, seo, ai, layout = "scroll" }: DecisionStackProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--on-surface)]">Domain Decision Stack</h2>
      <div
        className={
          layout === "grid"
            ? "grid gap-3"
            : "flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
        }
      >
        <StackCard label="Best for Brand" candidate={brand} />
        <StackCard label="Best for SEO" candidate={seo} />
        <StackCard label="Best for AI Visibility" candidate={ai} />
      </div>
    </section>
  );
}
