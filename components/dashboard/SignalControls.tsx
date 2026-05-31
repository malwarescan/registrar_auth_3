"use client";

import Link from "next/link";
import { ArrowLeftRight, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { DomainCandidate, OptimizeMode, SignalWeights } from "@/lib/types/domain";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

type SignalControlsProps = {
  optimize: OptimizeMode;
  onOptimizeChange: (mode: OptimizeMode) => void;
  weights: SignalWeights;
  onWeightChange: (key: keyof SignalWeights, value: number) => void;
  shortlist: DomainCandidate[];
  onCompareShortlist: () => void;
};

const OPTIMIZE_OPTIONS: { value: OptimizeMode; label: string }[] = [
  { value: "overall", label: "Overall" },
  { value: "brand", label: "Brand" },
  { value: "seo", label: "SEO" },
  { value: "ai", label: "AI" },
  { value: "value", label: "Value" },
  { value: "resale", label: "Resale" },
  { value: "trust", label: "Trust" },
  { value: "marketing", label: "Marketing" },
];

const WEIGHT_LABELS: { key: keyof SignalWeights; label: string }[] = [
  { key: "brand", label: "Brand Strength" },
  { key: "seo", label: "SEO Fit" },
  { key: "ai", label: "AI Visibility" },
  { key: "value", label: "Price-to-Value" },
  { key: "trust", label: "Trust" },
  { key: "resale", label: "Resale Potential" },
];

export function SignalControls({
  optimize,
  onOptimizeChange,
  weights,
  onWeightChange,
  shortlist,
  onCompareShortlist,
}: SignalControlsProps) {
  return (
    <div className="space-y-4">
      <Card padding="md" className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--on-surface)]">Signal Model</h2>
          <p className="text-xs text-[var(--on-surface-variant)]">
            Scores derive from query token coverage, label clarity (length + word boundaries), and TLD trust.
            Overall = weighted blend of Brand, SEO, AI, Value, Trust, and Resale minus risk penalty.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
            Optimize for
          </p>
          <div className="flex flex-wrap gap-1.5">
            {OPTIMIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onOptimizeChange(opt.value);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  optimize === opt.value
                    ? "border-[var(--secondary)] bg-[var(--surface-container-low)] text-[var(--secondary)]"
                    : "border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:border-[var(--outline)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
            Signal Weights
          </p>
          {WEIGHT_LABELS.map(({ key, label }) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">{weights[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={3}
                step={0.5}
                value={weights[key]}
                onChange={(e) => onWeightChange(key, parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-[var(--secondary)]"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="text-xs text-[var(--secondary)] hover:underline"
          onClick={() => {
            const preset = OPTIMIZE_PRESETS[optimize];
            Object.entries(preset).forEach(([k, v]) =>
              onWeightChange(k as keyof SignalWeights, v)
            );
          }}
        >
          Reset weights to preset
        </button>
      </Card>

      <Card padding="md" className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--on-surface)]">Shortlist</h2>
        {shortlist.length === 0 ? (
          <p className="text-xs text-[var(--on-surface-variant)]">
            Select domains from the graph, matrix, or cards.
          </p>
        ) : (
          <ul className="space-y-2">
            {shortlist.map((c) => (
              <li key={c.domain} className="flex items-center justify-between text-xs">
                <span className="font-medium">{c.domain}</span>
                <span className="tabular-nums text-[var(--on-surface-variant)]">
                  ${c.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={shortlist.length < 2}
          onClick={onCompareShortlist}
        >
          <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
          Compare selected ({shortlist.length})
        </Button>
        <Link href="/ask">
          <Button variant="ghost" size="sm" className="w-full">
            <HelpCircle className="mr-1 h-3.5 w-3.5" /> Ask about results
          </Button>
        </Link>
      </Card>
    </div>
  );
}
