"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SignalWinner } from "@/lib/types/domain";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";
import { cn } from "@/lib/utils";

type SignalWinnersBoardProps = {
  winners: SignalWinner[];
  activeDomain?: string | null;
  onSelectDomain?: (domain: string) => void;
  onCompare?: (domain: string) => void;
};

export function SignalWinnersBoard({
  winners,
  activeDomain,
  onSelectDomain,
  onCompare,
}: SignalWinnersBoardProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
        Signal Winners
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {winners.map((w) => (
          <Card
            key={w.id}
            padding="sm"
            className={cn(
              "cursor-pointer transition-colors hover:border-[var(--secondary)]",
              activeDomain === w.domain && "border-[var(--secondary)] bg-[var(--surface-container-low)]"
            )}
            onClick={() => onSelectDomain?.(w.domain)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--secondary)]">
                  {w.label}
                </p>
                <Link
                  href={`/domain/${domainToSlug(w.domain)}`}
                  className="mt-0.5 block truncate font-semibold text-[var(--on-surface)] hover:text-[var(--secondary)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {w.domain}
                </Link>
                <p className="text-sm font-bold tabular-nums">
                  ${w.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--surface-container)] px-2 py-0.5 text-xs font-bold tabular-nums">
                {Math.round(w.score)}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-[var(--on-surface-variant)]">{w.reason}</p>
            {onCompare && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(w.domain);
                }}
              >
                <ArrowLeftRight className="mr-1 h-3 w-3" /> Compare
              </Button>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
