"use client";

import type { SearchMode } from "@/lib/search/search-config";
import { SEARCH_MODES } from "@/lib/search/search-config";
import { cn } from "@/lib/utils";

const SHORT_LABELS: Record<SearchMode, string> = {
  business_idea: "Idea",
  keyword: "Keyword",
  current_domain: "Current domain",
  industry: "Industry",
  investor_research: "Investor",
};

type SearchModeTabsProps = {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
};

export function SearchModeTabs({ value, onChange }: SearchModeTabsProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
        Search mode
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SEARCH_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            title={mode.description}
            onClick={() => onChange(mode.value)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              value === mode.value
                ? "border-[var(--secondary)] bg-[var(--secondary)] text-white"
                : "border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] hover:border-[var(--secondary)]"
            )}
          >
            {SHORT_LABELS[mode.value]}
          </button>
        ))}
      </div>
    </div>
  );
}
