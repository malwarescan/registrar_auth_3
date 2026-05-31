"use client";

import { EXAMPLE_BRIEFS } from "@/lib/search/brief-config";
import type { DomainBrief } from "@/lib/types/domain-brief";

type ExampleBriefChipsProps = {
  onSelect: (brief: Partial<DomainBrief>) => void;
};

export function ExampleBriefChips({ onSelect }: ExampleBriefChipsProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-[var(--on-surface-variant)]">Start with an example brief</p>
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_BRIEFS.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => onSelect(ex.brief)}
            className="whitespace-nowrap rounded-full border border-[var(--outline-variant)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--on-surface-variant)] transition-colors hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
          >
            {ex.title}
          </button>
        ))}
      </div>
    </div>
  );
}
