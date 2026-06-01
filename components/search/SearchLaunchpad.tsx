"use client";

import { EXAMPLE_BRIEFS } from "@/lib/search/brief-config";
import type { DomainBrief } from "@/lib/types/domain-brief";
import { Card } from "@/components/ui/Card";
import { ExampleSignalMap } from "@/components/search/ExampleSignalMap";

type SearchLaunchpadProps = {
  onExampleBrief?: (brief: Partial<DomainBrief>) => void;
};

export function SearchLaunchpad({ onExampleBrief }: SearchLaunchpadProps) {
  return (
    <div className="space-y-8">
      <ExampleSignalMap />

      <section>
        <h2 className="text-base font-semibold text-[var(--on-surface)]">Start with a domain brief</h2>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Click a card to prefill strategy inputs for a common naming decision.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_BRIEFS.map((ex) => (
            <Card
              key={ex.id}
              padding="md"
              onClick={() => onExampleBrief?.(ex.brief)}
              className="transition-colors hover:border-[var(--secondary)] hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold text-[var(--on-surface)]">{ex.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-[var(--on-surface-variant)]">
                {ex.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
