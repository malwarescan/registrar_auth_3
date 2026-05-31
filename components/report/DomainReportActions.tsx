"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DomainCandidate } from "@/lib/types/domain";
import { useShortlistContext } from "@/lib/shortlist/shortlist-context";

type DomainReportActionsProps = {
  candidate: DomainCandidate;
};

export function DomainReportActions({ candidate }: DomainReportActionsProps) {
  const { add, isShortlisted } = useShortlistContext();
  const shortlisted = isShortlisted(candidate.domain);

  return (
    <button
      type="button"
      onClick={() => add(candidate)}
      disabled={shortlisted}
      className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-[var(--secondary)] disabled:opacity-50"
    >
      <Heart className={`h-4 w-4 ${shortlisted ? "fill-current" : ""}`} />
      {shortlisted ? "Shortlisted" : "Shortlist"}
    </button>
  );
}
