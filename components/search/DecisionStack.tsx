"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { DecisionStack as DecisionStackData, DomainCandidate } from "@/lib/types/domain";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";
import {
  canPurchaseDomain,
  getAvailabilityLabel,
  shouldShowPrice,
} from "@/lib/domains/availability";

type DecisionStackProps = {
  stack: DecisionStackData;
  layout?: "scroll" | "grid";
  onCompare?: (domain: string) => void;
};

type SlotConfig = {
  key: keyof DecisionStackData;
  label: string;
  reason: (c: DomainCandidate) => string | undefined;
};

const SLOTS: SlotConfig[] = [
  { key: "overall", label: "Best Overall", reason: (c) => c.analysis.recommendedAction },
  { key: "brand", label: "Best Brand", reason: (c) => c.analysis.signalEvidence?.brand },
  { key: "seo", label: "Best SEO Fit", reason: (c) => c.analysis.signalEvidence?.seo },
  { key: "ai", label: "Best AI Visibility", reason: (c) => c.analysis.signalEvidence?.ai },
  { key: "value", label: "Best Value", reason: (c) => c.analysis.signalEvidence?.value },
  { key: "risk", label: "Lowest Risk", reason: (c) => c.analysis.signalEvidence?.risk },
  {
    key: "resale",
    label: "Best Resale Potential",
    reason: (c) => c.analysis.signalEvidence?.resale,
  },
];

function StackCard({
  label,
  candidate,
  reason,
  onCompare,
}: {
  label: string;
  candidate: DomainCandidate;
  reason?: string;
  onCompare?: (domain: string) => void;
}) {
  const showPrice = shouldShowPrice(candidate);
  const purchasable = canPurchaseDomain(candidate);

  return (
    <Card className="flex h-full min-w-[180px] shrink-0 flex-col hover:border-[var(--secondary)] lg:min-w-0" padding="sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
        {label}
      </p>
      <Link
        href={`/domain/${domainToSlug(candidate.domain)}`}
        className="mt-1 font-semibold text-[var(--on-surface)] hover:text-[var(--secondary)]"
      >
        {candidate.domain}
      </Link>
      {showPrice ? (
        <p className="mt-1 text-lg font-bold tabular-nums text-[var(--on-surface)]">
          ${candidate.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          {candidate.priceType === "registration" && (
            <span className="text-xs font-normal text-[var(--on-surface-variant)]">/yr</span>
          )}
        </p>
      ) : (
        <p className="mt-1 text-sm font-medium text-[var(--on-surface-variant)]">
          {getAvailabilityLabel(candidate.availabilityStatus)}
        </p>
      )}
      {reason && (
        <p className="mt-2 line-clamp-2 text-xs text-[var(--on-surface-variant)]">{reason}</p>
      )}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        <Link href={`/domain/${domainToSlug(candidate.domain)}`}>
          <Button variant="outline" size="sm">
            Review
          </Button>
        </Link>
        {onCompare && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCompare(candidate.domain)}
          >
            <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
            Compare
          </Button>
        )}
        {purchasable && showPrice && (
          <span className="sr-only">Buy Now available on domain detail page</span>
        )}
      </div>
    </Card>
  );
}

export function DecisionStack({ stack, layout = "scroll", onCompare }: DecisionStackProps) {
  const cards = SLOTS.filter((slot) => stack[slot.key]).map((slot) => ({
    ...slot,
    candidate: stack[slot.key]!,
  }));

  if (cards.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-[var(--on-surface)]">Domain Decision Stack</h2>
        <p className="mt-0.5 text-xs text-[var(--on-surface-variant)]">
          Top purchasable picks by signal — benchmarks and taken names are excluded.
        </p>
      </div>
      <div
        className={
          layout === "grid"
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden"
        }
      >
        {cards.map(({ key, label, candidate, reason }) => (
          <StackCard
            key={key}
            label={label}
            candidate={candidate}
            reason={reason(candidate)}
            onCompare={onCompare}
          />
        ))}
      </div>
    </section>
  );
}
