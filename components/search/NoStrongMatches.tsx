"use client";

import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { NO_MATCH_SUGGESTIONS } from "@/lib/search/search-config";
import type { OptimizeMode } from "@/lib/types/domain";

type NoStrongMatchesProps = {
  query: string;
  onRetryPath: (optimize: OptimizeMode) => void;
};

export function NoStrongMatches({ query, onRetryPath }: NoStrongMatchesProps) {
  return (
    <Card padding="lg" className="text-center">
      <h2 className="text-lg font-semibold text-[var(--on-surface)]">
        No strong exact matches found
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--on-surface-variant)]">
        We couldn&apos;t find domains that strongly match &ldquo;{query}&rdquo; with your current
        filters. Try one of these paths instead:
      </p>
      <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2">
        {NO_MATCH_SUGGESTIONS.map((s) => (
          <Chip key={s.label} onClick={() => onRetryPath(s.optimize)}>
            {s.label}
          </Chip>
        ))}
      </div>
      <p className="mt-6 text-xs text-[var(--on-surface-variant)]">
        Tip: broaden your search, remove TLD filters, or try a shorter business idea.
      </p>
    </Card>
  );
}
