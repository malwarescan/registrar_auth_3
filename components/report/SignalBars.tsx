"use client";

import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { SignalScores } from "@/lib/types/domain";

const SIGNAL_META: Array<{
  key: keyof SignalScores;
  label: string;
  subtext: (score: number) => string;
  variant: "primary" | "secondary";
}> = [
  { key: "brand", label: "Brand Strength", subtext: () => "Short, memorable, descriptive.", variant: "primary" },
  { key: "marketing", label: "Marketing Clarity", subtext: () => "Clear value proposition.", variant: "primary" },
  { key: "search", label: "Search Relevance", subtext: () => "Strong match for smart-home intent.", variant: "primary" },
  { key: "ai", label: "AI/Entity Clarity", subtext: () => "High potential for semantic indexing.", variant: "primary" },
  { key: "trust", label: "Trust", subtext: (s) => s < 70 ? ".tech TLD may reduce initial consumer trust." : "Solid TLD trust profile.", variant: "secondary" },
  { key: "resale", label: "Resale Potential", subtext: (s) => s < 70 ? "Moderate value due to TLD limitations." : "Good resale potential.", variant: "secondary" },
];

type SignalBarsProps = {
  signals: SignalScores;
};

export function SignalBars({ signals }: SignalBarsProps) {
  return (
    <Card className="space-y-4">
      <h2 className="text-base font-semibold text-[var(--on-surface)]">Signal Breakdown</h2>
      {SIGNAL_META.map(({ key, label, subtext, variant }) => (
        <ProgressBar
          key={key}
          label={label}
          value={signals[key]}
          subtext={subtext(signals[key])}
          variant={variant}
        />
      ))}
    </Card>
  );
}
