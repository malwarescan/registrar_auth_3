"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const STEPS = [
  "Generating signal map",
  "Ranking domain options",
  "Comparing brand, SEO, AI visibility, and trust",
  "Checking marketplace availability",
];

type SearchAnalyzingProps = {
  query: string;
};

export function SearchAnalyzing({ query }: SearchAnalyzingProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card padding="lg" className="border-[var(--secondary)]/30 bg-[var(--surface-container-low)]">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[var(--secondary)]/20" />
        <h2 className="text-lg font-semibold text-[var(--on-surface)]">
          Analyzing &ldquo;{query}&rdquo;
        </h2>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Building your signal intelligence dashboard…
        </p>
      </div>
      <ul className="mx-auto mt-6 max-w-sm space-y-2">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              i <= activeStep
                ? "bg-white text-[var(--on-surface)]"
                : "text-[var(--on-surface-variant)]"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                i < activeStep
                  ? "bg-[var(--success)] text-white"
                  : i === activeStep
                    ? "bg-[var(--secondary)] text-white animate-pulse"
                    : "bg-[var(--outline-variant)] text-[var(--on-surface-variant)]"
              )}
            >
              {i < activeStep ? "✓" : i + 1}
            </span>
            {step}
          </li>
        ))}
      </ul>
    </Card>
  );
}
