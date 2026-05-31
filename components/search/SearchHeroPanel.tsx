"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchModeTabs } from "@/components/search/SearchModeTabs";
import { RequirementChips } from "@/components/search/RequirementChips";
import { ExampleBriefChips } from "@/components/search/ExampleBriefChips";
import type { DomainBrief, SearchUIMode } from "@/lib/types/domain-brief";
import type { SearchMode } from "@/lib/search/search-config";
import { getSuggestions } from "@/lib/search/search-config";
import {
  GOAL_VISIBLE_FIELDS,
  SEARCH_GOALS,
  WEIGHT_LABELS,
} from "@/lib/search/brief-config";
import { cn } from "@/lib/utils";

type SearchHeroPanelProps = {
  brief: DomainBrief;
  onBriefChange: (brief: DomainBrief) => void;
  uiMode: SearchUIMode;
  onUiModeChange: (mode: SearchUIMode) => void;
  onAnalyze: () => void;
  loading?: boolean;
  compact?: boolean;
  onExampleBrief?: (brief: Partial<DomainBrief>) => void;
};

function BriefSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[var(--outline-variant)] bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-[var(--on-surface)]"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-[var(--on-surface-variant)]", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-[var(--outline-variant)] px-3 py-3">{children}</div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--on-surface-variant)]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--outline-variant)] px-3 py-2 text-sm outline-none focus:border-[var(--secondary)]"
      />
    </label>
  );
}

export function SearchHeroPanel({
  brief,
  onBriefChange,
  uiMode,
  onUiModeChange,
  onAnalyze,
  loading,
  compact,
  onExampleBrief,
}: SearchHeroPanelProps) {
  const [focused, setFocused] = useState(false);
  const update = (patch: Partial<DomainBrief>) => onBriefChange({ ...brief, ...patch });

  const suggestions = useMemo(() => {
    if (!focused || brief.naming.trim().length < 2) return [];
    return getSuggestions(brief.naming);
  }, [focused, brief.naming]);

  const visibleFields = brief.searchGoal ? GOAL_VISIBLE_FIELDS[brief.searchGoal] : null;
  const show = (field: string) => !visibleFields || visibleFields.includes(field);

  if (compact) {
    return (
      <Card padding="sm" className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-variant)]" />
          <input
            type="search"
            value={brief.naming}
            onChange={(e) => update({ naming: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
            placeholder="What are you naming?"
            className="w-full rounded-lg border border-[var(--outline-variant)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--secondary)]"
          />
        </div>
        <Button onClick={onAnalyze} disabled={loading || !brief.naming.trim()}>
          {loading ? "Analyzing…" : "Analyze Domains"}
        </Button>
      </Card>
    );
  }

  return (
    <Card
      padding="lg"
      className="border border-[var(--outline-variant)] bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h1 className="text-xl font-bold tracking-tight text-[var(--on-surface)] md:text-2xl">
            Find the strongest domain for your strategy
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--on-surface-variant)]">
            Enter what you are building and what matters most. We&apos;ll rank domains by brand
            strength, SEO fit, AI visibility, trust, value, resale potential, and risk — then pin the
            strongest choice.
          </p>
        </div>
        <SegmentedControl
          className="shrink-0 sm:w-56"
          options={[
            { value: "quick" as SearchUIMode, label: "Quick Search" },
            { value: "strategy" as SearchUIMode, label: "Strategy Brief" },
          ]}
          value={uiMode}
          onChange={onUiModeChange}
          variant="primary"
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
          What are you naming?
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-variant)]" />
          <input
            type="search"
            value={brief.naming}
            onChange={(e) => update({ naming: e.target.value })}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
            placeholder="Eco home technology SaaS for homeowners"
            className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]/15"
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-white shadow-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-container-low)]"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    update({ naming: s });
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs text-[var(--on-surface-variant)]">
          Business idea, keyword, current domain, industry, or investor research
        </p>
      </div>

      <div className="mt-4">
        <SearchModeTabs
          value={brief.searchMode}
          onChange={(mode) => update({ searchMode: mode as SearchMode })}
        />
      </div>

      {uiMode === "strategy" && (
        <div className="mt-4 space-y-2">
          <BriefSection title="Search goal" defaultOpen>
            <div className="grid gap-2 sm:grid-cols-2">
              {SEARCH_GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => update({ searchGoal: g.value })}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                    brief.searchGoal === g.value
                      ? "border-[var(--secondary)] bg-[var(--surface-container-low)]"
                      : "border-[var(--outline-variant)] hover:border-[var(--secondary)]/50"
                  )}
                >
                  <span className="font-medium text-[var(--on-surface)]">{g.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--on-surface-variant)]">
                    {g.description}
                  </span>
                </button>
              ))}
            </div>
          </BriefSection>

          <BriefSection title="Business context">
            <div className="grid gap-3 sm:grid-cols-2">
              {show("industry") && (
                <Field label="Industry" value={brief.industry} onChange={(v) => update({ industry: v })} placeholder="Smart home / energy" />
              )}
              {show("audience") && (
                <Field label="Target audience" value={brief.audience} onChange={(v) => update({ audience: v })} placeholder="Homeowners" />
              )}
              {show("location") && (
                <Field label="Location / scope" value={brief.location} onChange={(v) => update({ location: v })} placeholder="Florida" />
              )}
              {show("currentDomain") && (
                <Field label="Current domain" value={brief.currentDomain} onChange={(v) => update({ currentDomain: v })} placeholder="mybrand.io" />
              )}
              {show("competitors") && (
                <Field label="Competitors" value={brief.competitors} onChange={(v) => update({ competitors: v })} placeholder="competitor.com" />
              )}
            </div>
          </BriefSection>

          <BriefSection title="Priority weights">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              {WEIGHT_LABELS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0 text-[var(--on-surface-variant)]">{label}</span>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={0.5}
                    value={brief.priorityWeights[key]}
                    onChange={(e) =>
                      update({
                        priorityWeights: {
                          ...brief.priorityWeights,
                          [key]: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="min-w-0 flex-1 accent-[var(--secondary)]"
                  />
                </label>
              ))}
            </div>
          </BriefSection>

          <BriefSection title="Domain requirements">
            <RequirementChips
              selected={brief.requirements}
              onChange={(v) => update({ requirements: v })}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                value={brief.maxPrice}
                onChange={(e) => update({ maxPrice: parseInt(e.target.value, 10) })}
                className="rounded-md border border-[var(--outline-variant)] px-2 py-1.5 text-xs"
              >
                <option value={500}>Under $500</option>
                <option value={2000}>Under $2,000</option>
                <option value={5000}>Under $5k</option>
                <option value={10000}>Under $10k</option>
              </select>
              <select
                value={brief.tldPreference}
                onChange={(e) => update({ tldPreference: e.target.value })}
                className="rounded-md border border-[var(--outline-variant)] px-2 py-1.5 text-xs"
              >
                <option value="any">Any TLD</option>
                <option value="com">.com</option>
                <option value="net">.net</option>
                <option value="io">.io</option>
              </select>
              <Chip active={brief.buyNowOnly} onClick={() => update({ buyNowOnly: !brief.buyNowOnly })} className="text-xs">
                Buy now only
              </Chip>
            </div>
          </BriefSection>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="lg" onClick={onAnalyze} disabled={loading || !brief.naming.trim()}>
          {loading ? "Analyzing…" : "Analyze Domains"}
        </Button>
        <Link href="https://www.namesilo.com/marketplace" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg" type="button">
            Browse Marketplace
          </Button>
        </Link>
      </div>

      <div className="mt-5 border-t border-[var(--outline-variant)] pt-4">
        <ExampleBriefChips onSelect={(b) => onExampleBrief?.(b)} />
      </div>
    </Card>
  );
}

/** @deprecated use SearchHeroPanel */
export const DomainBriefBuilder = SearchHeroPanel;
