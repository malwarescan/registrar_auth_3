"use client";

import Link from "next/link";
import { Heart, ArrowLeftRight, Pin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { DomainCandidate, DomainRankings } from "@/lib/types/domain";
import { getTopRankChips } from "@/lib/intelligence/dashboard";
import { getBuyUrl } from "@/lib/namesilo/urls";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";
import { cn } from "@/lib/utils";
import {
  canPurchaseDomain,
  getAvailabilityLabel,
  isBenchmarkOnly,
  shouldShowPrice,
} from "@/lib/domains/availability";
import { formatNamingLane } from "@/lib/ui/naming-lane-labels";

type RankedDomainCardProps = {
  candidate: DomainCandidate;
  rankings?: DomainRankings;
  total: number;
  rank: number;
  active?: boolean;
  onSelect?: () => void;
  onShortlist?: () => void;
  onCompare?: () => void;
  onPinBenchmark?: () => void;
  shortlisted?: boolean;
  isBenchmark?: boolean;
};

export function RankedDomainCard({
  candidate,
  rankings,
  total,
  rank,
  active,
  onSelect,
  onShortlist,
  onCompare,
  onPinBenchmark,
  shortlisted,
  isBenchmark,
}: RankedDomainCardProps) {
  const purchasable = canPurchaseDomain(candidate);
  const benchmarkOnly = isBenchmarkOnly(candidate);
  const showPrice = shouldShowPrice(candidate);
  const chips = rankings ? getTopRankChips(rankings, total, candidate) : [];
  const evidence = candidate.analysis.signalEvidence;

  return (
    <Card
      className={cn(
        "space-y-4 transition-colors",
        active && "border-[var(--secondary)] ring-1 ring-[var(--secondary)]",
        isBenchmark && "border-[var(--secondary)] bg-[var(--surface-container-low)]"
      )}
      onClick={onSelect}
    >
      {isBenchmark && (
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--secondary)]">
          <Pin className="h-3.5 w-3.5" /> Benchmark
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--theme-primary)] text-xs font-bold text-white">
              {purchasable ? rank : "B"}
            </span>
            <Link
              href={`/domain/${domainToSlug(candidate.domain)}`}
              className="text-xl font-bold text-[var(--on-surface)] hover:text-[var(--secondary)]"
              onClick={(e) => e.stopPropagation()}
            >
              {candidate.domain}
            </Link>
          </div>
          {showPrice ? (
            <p className="text-lg font-bold tabular-nums">
              ${candidate.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              {candidate.priceType === "registration" && (
                <span className="text-sm font-normal text-[var(--on-surface-variant)]">/yr</span>
              )}
            </p>
          ) : (
            <p className="text-lg font-bold text-[var(--on-surface)]">
              {candidate.availabilityStatus === "taken" ? "Taken" : "Not purchasable"}
            </p>
          )}
          <Badge
            variant={purchasable ? "success" : "default"}
            className="mt-1 text-[10px]"
          >
            {getAvailabilityLabel(candidate.availabilityStatus)}
            {benchmarkOnly && " — benchmark only"}
          </Badge>
          {candidate.namingLane && (
            <Badge variant="default" className="ml-1.5 mt-1 text-[10px] opacity-80">
              {formatNamingLane(candidate.namingLane)}
            </Badge>
          )}
        </div>
      </div>

      {(candidate.generationPass === 2 || candidate.seedDomain) && (
        <p className="text-[10px] leading-relaxed text-[var(--on-surface-variant)]">
          {candidate.generationPass === 2 && "Availability-aware refinement"}
          {candidate.generationPass === 2 && candidate.seedDomain && " · "}
          {candidate.seedDomain && `Inspired by ${candidate.seedDomain}`}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <Badge
            key={c.dimension}
            variant={c.rank === 1 ? "success" : "default"}
            className="text-[10px]"
          >
            {c.label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <ProgressBar label="Brand" value={candidate.signals.brand} variant="primary" />
        <ProgressBar label="SEO" value={candidate.signals.search} variant="primary" />
        <ProgressBar label="AI" value={candidate.signals.ai} variant="primary" />
        <ProgressBar label="Trust" value={candidate.signals.trust} variant="secondary" />
        <ProgressBar label="Value" value={Math.round(candidate.valueScore ?? 0)} variant="primary" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--success)]">
            Why it works
          </p>
          <ul className="space-y-1 text-sm text-[var(--on-surface-variant)]">
            {candidate.analysis.strengths.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
          {evidence && (
            <p className="mt-2 text-xs italic text-[var(--on-surface-variant)]">
              {evidence.seo}
            </p>
          )}
          {evidence && (candidate.riskScore ?? 100) <= 30 && (
            <p className="mt-2 text-xs text-[var(--success)]">{evidence.risk}</p>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--error)]">
            Watch out
          </p>
          <ul className="space-y-1 text-sm text-[var(--on-surface-variant)]">
            {candidate.analysis.watchOuts.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
          {evidence && (candidate.riskScore ?? 100) > 30 && (
            <p className="mt-2 text-xs italic text-[var(--on-surface-variant)]">
              {evidence.risk}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-[var(--surface-container-low)] p-2 text-xs">
          <span className="font-bold text-[var(--secondary)]">Best for: </span>
          {candidate.analysis.idealFor[0]}
        </div>
        <div className="rounded-md bg-[var(--error-container)] p-2 text-xs">
          <span className="font-bold text-[var(--error)]">Not ideal for: </span>
          {candidate.analysis.notIdealFor[0]}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {onPinBenchmark && (
          <Button variant={isBenchmark ? "primary" : "outline"} size="sm" onClick={(e) => { e.stopPropagation(); onPinBenchmark(); }}>
            <Pin className="mr-1 h-3.5 w-3.5" />
            {isBenchmark ? "Pinned" : "Pin as benchmark"}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onShortlist?.(); }} disabled={shortlisted}>
          <Heart className="mr-1 h-3.5 w-3.5" />
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </Button>
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onCompare?.(); }}>
          <ArrowLeftRight className="mr-1 h-3.5 w-3.5" /> Compare
        </Button>
        {purchasable ? (
          <a
            href={getBuyUrl(candidate.domain, candidate.priceType)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="sm">Buy Now</Button>
          </a>
        ) : (
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onCompare?.(); }}>
            Find available alternatives
          </Button>
        )}
      </div>
    </Card>
  );
}
