"use client";

import Link from "next/link";
import { Heart, Pin, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { PinRecommendation } from "@/lib/types/domain-brief";
import { getBuyUrl } from "@/lib/namesilo/urls";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";
import { canPurchaseDomain, getAvailabilityLabel, shouldShowPrice } from "@/lib/domains/availability";

type PinnedDomainCardProps = {
  recommendation: PinRecommendation;
  isUserPinned?: boolean;
  onPinBenchmark?: () => void;
  onShortlist?: () => void;
  onCompare?: () => void;
  shortlisted?: boolean;
};

export function PinnedDomainCard({
  recommendation,
  isUserPinned,
  onPinBenchmark,
  onShortlist,
  onCompare,
  shortlisted,
}: PinnedDomainCardProps) {
  const { domain, whyPinned, wins, tradeoff, recommendedIf, alternatives, score } = recommendation;
  const purchasable = canPurchaseDomain(domain);
  const showPrice = shouldShowPrice(domain);

  return (
    <Card padding="lg" className="border-2 border-[var(--secondary)] bg-gradient-to-br from-white to-[var(--surface-container-low)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Pin className="h-4 w-4 text-[var(--secondary)]" />
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--secondary)]">
              {isUserPinned ? "Your benchmark" : "Pinned best domain"}
            </span>
          </div>
          <Link
            href={`/domain/${domainToSlug(domain.domain)}`}
            className="text-2xl font-bold text-[var(--on-surface)] hover:text-[var(--secondary)] md:text-3xl"
          >
            {domain.domain}
          </Link>
          {showPrice ? (
            <p className="mt-1 text-lg font-bold tabular-nums">
              ${domain.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              {domain.priceType === "registration" && (
                <span className="text-sm font-normal text-[var(--on-surface-variant)]">/yr</span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-lg font-bold">{getAvailabilityLabel(domain.availabilityStatus)}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-sm font-bold tabular-nums text-white">
            {Math.round(score)}
          </span>
          <span className="text-xs text-[var(--on-surface-variant)]">Overall score</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--secondary)]">Why pinned</p>
          <p className="mt-1 text-sm text-[var(--on-surface)]">{whyPinned}</p>
          {wins.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {wins.map((w) => (
                <Badge key={w} variant="success" className="text-[10px]">
                  {w}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--warning)]">Tradeoff</p>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{tradeoff}</p>
          <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
            <span className="font-semibold text-[var(--on-surface)]">Recommended if: </span>
            {recommendedIf}
          </p>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="mt-4 rounded-lg bg-white/80 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
            Alternatives to consider
          </p>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((alt) => (
              <Link
                key={alt.domain}
                href={`/domain/${domainToSlug(alt.domain)}`}
                className="rounded-md border border-[var(--outline-variant)] px-2.5 py-1.5 text-xs hover:border-[var(--secondary)]"
              >
                <span className="font-semibold text-[var(--on-surface)]">{alt.domain}</span>
                <span className="ml-1.5 text-[var(--on-surface-variant)]">— {alt.reason}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {purchasable && (
          <a href={getBuyUrl(domain.domain, domain.priceType)} target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Buy Now
            </Button>
          </a>
        )}
        <Button variant="outline" size="sm" onClick={onShortlist} disabled={shortlisted}>
          <Heart className="mr-1 h-3.5 w-3.5" />
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </Button>
        <Button variant="outline" size="sm" onClick={onCompare}>
          <ArrowLeftRight className="mr-1 h-3.5 w-3.5" /> Compare
        </Button>
        {onPinBenchmark && (
          <Button variant="ghost" size="sm" onClick={onPinBenchmark}>
            <Pin className="mr-1 h-3.5 w-3.5" /> Pin as benchmark
          </Button>
        )}
      </div>
    </Card>
  );
}
