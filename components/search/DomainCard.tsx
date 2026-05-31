"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DomainCandidate } from "@/lib/types/domain";
import { useShortlistContext } from "@/lib/shortlist/shortlist-context";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";

type DomainCardProps = {
  candidate: DomainCandidate;
};

export function DomainCard({ candidate }: DomainCardProps) {
  const { add, isShortlisted } = useShortlistContext();
  const shortlisted = isShortlisted(candidate.domain);

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/domain/${domainToSlug(candidate.domain)}`} className="group">
          <h3 className="text-xl font-bold text-[var(--on-surface)] group-hover:text-[var(--secondary)]">
            {candidate.domain}
          </h3>
        </Link>
        <span className="text-lg font-bold tabular-nums text-[var(--on-surface)]">
          ${candidate.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {candidate.badges.map((badge) => (
          <Badge
            key={badge}
            variant={badge.includes("Price-to-Value") ? "success" : "primary"}
          >
            {badge}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--success)]">
            Why it works
          </p>
          <ul className="space-y-1 text-sm text-[var(--on-surface-variant)]">
            {candidate.analysis.strengths.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--error)]">
            Watch out
          </p>
          <ul className="space-y-1 text-sm text-[var(--on-surface-variant)]">
            {candidate.analysis.watchOuts.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => add(candidate)}
        disabled={shortlisted}
      >
        {shortlisted ? "In Shortlist" : "Add to Shortlist"}
      </Button>
    </Card>
  );
}
