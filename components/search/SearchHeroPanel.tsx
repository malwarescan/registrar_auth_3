"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { RequirementChips } from "@/components/search/RequirementChips";
import { ExampleBriefChips } from "@/components/search/ExampleBriefChips";
import type { BuyingIntent, DomainBrief } from "@/lib/types/domain-brief";
import {
  applyIntentToBrief,
  BUDGET_OPTIONS,
  BUYING_INTENTS,
  INTENT_VISIBLE_FIELDS,
  MARKET_SCOPES,
  TLD_OPTIONS,
  WEIGHT_LABELS,
} from "@/lib/search/brief-config";
import { cn } from "@/lib/utils";

type SearchHeroPanelProps = {
  brief: DomainBrief;
  onBriefChange: (brief: DomainBrief) => void;
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

function ChipSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };
  return (
    <div>
      <span className="mb-1.5 block text-xs text-[var(--on-surface-variant)]">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <Chip key={opt} active={selected.includes(opt)} onClick={() => toggle(opt)} className="text-xs">
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function SearchHeroPanel({
  brief,
  onBriefChange,
  onAnalyze,
  loading,
  compact,
  onExampleBrief,
}: SearchHeroPanelProps) {
  const update = (patch: Partial<DomainBrief>) => onBriefChange({ ...brief, ...patch });

  const handleIntentChange = (intent: BuyingIntent) => {
    onBriefChange(applyIntentToBrief(brief, intent));
  };

  const visibleFields = brief.buyingIntent ? INTENT_VISIBLE_FIELDS[brief.buyingIntent] : [];
  const show = (field: string) => visibleFields.includes(field);

  const canAnalyze = Boolean(brief.buyingIntent && brief.naming.trim());

  if (compact) {
    return (
      <Card padding="sm" className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-[var(--on-surface-variant)]">
              Buying intent
            </span>
            <select
              value={brief.buyingIntent ?? ""}
              onChange={(e) => handleIntentChange(e.target.value as BuyingIntent)}
              className="w-full rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm"
            >
              <option value="">Select intent…</option>
              {BUYING_INTENTS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-[var(--on-surface-variant)]">
              What you are building
            </span>
            <input
              type="search"
              value={brief.naming}
              onChange={(e) => update({ naming: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && canAnalyze && onAnalyze()}
              placeholder="Home security system company"
              className="w-full rounded-lg border border-[var(--outline-variant)] py-2 px-3 text-sm outline-none focus:border-[var(--secondary)]"
            />
          </label>
        </div>
        <Button onClick={onAnalyze} disabled={loading || !canAnalyze}>
          {loading ? "Analyzing…" : "Analyze Domains"}
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="border border-[var(--outline-variant)] bg-white shadow-sm">
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold tracking-tight text-[var(--on-surface)] md:text-2xl">
          Find the strongest domain for your strategy
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--on-surface-variant)]">
          Tell us why you are buying a domain and what you are building. We&apos;ll generate candidates,
          verify availability through NameSilo, then rank them by brand, marketing, SEO, AI visibility,
          trust, value, resale potential, and risk.
        </p>
      </div>

      {/* Step 1: Buying intent */}
      <div className="mt-6">
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
          Step 1 — What are you buying this domain for?
        </label>
        <select
          value={brief.buyingIntent ?? ""}
          onChange={(e) => handleIntentChange(e.target.value as BuyingIntent)}
          className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3 py-2.5 text-sm outline-none focus:border-[var(--secondary)]"
        >
          <option value="">Select buying intent…</option>
          {BUYING_INTENTS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label} — {g.description}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Business context */}
      <div className="mt-5">
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
          Step 2 — Tell us what you are building
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-variant)]" />
          <input
            type="search"
            value={brief.naming}
            onChange={(e) => update({ naming: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canAnalyze && onAnalyze()}
            placeholder='Example: "home security system company" or "AI real estate assistant"'
            className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]/15"
          />
        </div>
      </div>

      {/* Step 3: Dynamic context */}
      {brief.buyingIntent && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
            Step 3 — Optional context
          </p>

          <BriefSection title="Business & audience context" defaultOpen>
            <div className="grid gap-3 sm:grid-cols-2">
              {show("personalName") && (
                <Field label="Your name" value={brief.personalName} onChange={(v) => update({ personalName: v })} placeholder="Jane Smith" />
              )}
              {show("profession") && (
                <Field label="Profession" value={brief.profession} onChange={(v) => update({ profession: v })} placeholder="Consultant, designer…" />
              )}
              {show("industry") && (
                <Field label="Industry" value={brief.industry} onChange={(v) => update({ industry: v })} placeholder="Home security" />
              )}
              {show("productService") && (
                <Field label="Service / product" value={brief.productService} onChange={(v) => update({ productService: v })} placeholder="Landscaping, alarm install…" />
              )}
              {show("audience") && (
                <Field label="Target customer" value={brief.audience} onChange={(v) => update({ audience: v })} placeholder="Homeowners, families" />
              )}
              {show("location") && (
                <Field label="City / region" value={brief.location} onChange={(v) => update({ location: v })} placeholder="Austin, TX" />
              )}
              {show("currentDomain") && (
                <Field label="Current domain" value={brief.currentDomain} onChange={(v) => update({ currentDomain: v })} placeholder="mybrand.io" />
              )}
              {show("competitors") && (
                <Field label="Competitors / related brands" value={brief.competitors} onChange={(v) => update({ competitors: v })} placeholder="competitor.com" />
              )}
              {show("marketScope") && (
                <label className="block">
                  <span className="mb-1 block text-xs text-[var(--on-surface-variant)]">Market scope</span>
                  <select
                    value={brief.marketScope}
                    onChange={(e) => update({ marketScope: e.target.value })}
                    className="w-full rounded-md border border-[var(--outline-variant)] px-3 py-2 text-sm"
                  >
                    <option value="">Select…</option>
                    {MARKET_SCOPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {show("brandTones") && (
              <ChipSelect
                label="Brand tone"
                options={["Trustworthy", "Modern", "Premium", "Simple", "Protective", "Friendly", "Technical"]}
                selected={brief.brandTones}
                onChange={(v) => update({ brandTones: v })}
              />
            )}
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

          <BriefSection title="Requirements">
            <RequirementChips selected={brief.requirements} onChange={(v) => update({ requirements: v })} />
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                value={brief.maxPrice}
                onChange={(e) => update({ maxPrice: parseInt(e.target.value, 10) })}
                className="rounded-md border border-[var(--outline-variant)] px-2 py-1.5 text-xs"
              >
                {BUDGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={brief.tldPreference}
                onChange={(e) => update({ tldPreference: e.target.value })}
                className="rounded-md border border-[var(--outline-variant)] px-2 py-1.5 text-xs"
              >
                {TLD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </BriefSection>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="lg" onClick={onAnalyze} disabled={loading || !canAnalyze}>
          {loading ? "Analyzing…" : "Analyze Domains"}
        </Button>
      </div>

      <div className="mt-5 border-t border-[var(--outline-variant)] pt-4">
        <ExampleBriefChips onSelect={(b) => onExampleBrief?.(b)} />
      </div>
    </Card>
  );
}

/** @deprecated use SearchHeroPanel */
export const DomainBriefBuilder = SearchHeroPanel;
