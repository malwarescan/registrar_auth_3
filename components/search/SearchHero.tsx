"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import type { OptimizeMode } from "@/lib/types/domain";
import {
  EXAMPLE_SEARCHES,
  MODE_PLACEHOLDERS,
  OPTIMIZE_CHIPS,
  SEARCH_MODES,
  getSuggestions,
  type SearchMode,
} from "@/lib/search/search-config";
import { cn } from "@/lib/utils";

type SearchHeroProps = {
  query: string;
  onQueryChange: (value: string) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  optimize: OptimizeMode;
  onOptimizeChange: (mode: OptimizeMode) => void;
  maxPrice: number;
  tld: string;
  maxLength: number;
  buyNowOnly: boolean;
  onMaxPriceChange: () => void;
  onTldChange: () => void;
  onMaxLengthChange: () => void;
  onBuyNowToggle: () => void;
  onAnalyze: () => void;
  loading?: boolean;
  compact?: boolean;
  onExampleSelect?: (example: string) => void;
};

export function SearchHero({
  query,
  onQueryChange,
  searchMode,
  onSearchModeChange,
  optimize,
  onOptimizeChange,
  maxPrice,
  tld,
  maxLength,
  buyNowOnly,
  onMaxPriceChange,
  onTldChange,
  onMaxLengthChange,
  onBuyNowToggle,
  onAnalyze,
  loading,
  compact,
  onExampleSelect,
}: SearchHeroProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(
    () => (focused && query.trim().length >= 2 ? getSuggestions(query) : []),
    [focused, query]
  );

  const examples = EXAMPLE_SEARCHES.slice(0, 6);
  const activeFilterCount =
    (tld !== "all" ? 1 : 0) + (maxPrice < 5000 ? 1 : 0) + (maxLength < 20 ? 1 : 0) + (buyNowOnly ? 1 : 0);

  return (
    <Card
      padding="lg"
      className={cn(
        "border-[var(--secondary)]/20 bg-gradient-to-b from-white to-[var(--surface-container-low)] shadow-sm",
        compact && "p-4"
      )}
    >
      {!compact && (
        <div className="mb-6 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--on-surface)] md:text-3xl">
            Find the strongest domain for what you are building
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--on-surface-variant)] md:text-base">
            Search a business idea, keyword, current domain, or industry. NameSilo will rank available
            domains by brand strength, SEO fit, AI visibility, trust, price-to-value, and risk.
          </p>
        </div>
      )}

      {/* Search mode tabs */}
      {!compact && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
            What are you researching?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SEARCH_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                title={mode.description}
                onClick={() => onSearchModeChange(mode.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  searchMode === mode.value
                    ? "border-[var(--secondary)] bg-[var(--secondary)] text-white"
                    : "border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] hover:border-[var(--secondary)]"
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search input row */}
      <div className="relative">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-variant)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
              placeholder={MODE_PLACEHOLDERS[searchMode]}
              className="w-full rounded-xl border border-[var(--outline-variant)] bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]/20 md:text-base"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-white shadow-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--surface-container-low)]"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onQueryChange(s);
                      onExampleSelect?.(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="lg" onClick={onAnalyze} disabled={loading || !query.trim()} className="flex-1 sm:flex-none">
              {loading ? "Analyzing…" : "Analyze Domains"}
            </Button>
            <Link
              href="https://www.namesilo.com/marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button variant="outline" size="lg" type="button">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Optimize for */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
          Optimize for
        </p>
        <div className="flex flex-wrap gap-1.5">
          {OPTIMIZE_CHIPS.map((chip) => (
            <Chip
              key={chip.value}
              active={optimize === chip.value}
              onClick={() => onOptimizeChange(chip.value)}
              className="text-xs"
            >
              {chip.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Optional filters */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--on-surface-variant)] hover:text-[var(--secondary)]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Optional filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", filtersOpen && "rotate-180")} />
        </button>
        {filtersOpen && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip onClick={onTldChange}>
              TLD: {tld === "all" ? "Any" : `.${tld}`}
            </Chip>
            <Chip onClick={onMaxPriceChange}>
              Max price: ${maxPrice >= 1000 ? `${maxPrice / 1000}k` : maxPrice}
            </Chip>
            <Chip onClick={onMaxLengthChange}>Max length: {maxLength}</Chip>
            <Chip active={buyNowOnly} onClick={onBuyNowToggle}>
              Buy now
            </Chip>
          </div>
        )}
      </div>

      {/* Example searches */}
      {!compact && (
        <div className="mt-5 border-t border-[var(--outline-variant)] pt-4">
          <p className="mb-2 text-xs text-[var(--on-surface-variant)]">Try an example search</p>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  onQueryChange(ex);
                  onExampleSelect?.(ex);
                }}
                className="rounded-full border border-dashed border-[var(--outline-variant)] bg-white/80 px-2.5 py-1 text-xs text-[var(--on-surface-variant)] transition-colors hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
