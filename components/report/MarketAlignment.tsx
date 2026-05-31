import { Check, X, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { DomainAnalysis } from "@/lib/types/domain";

type MarketAlignmentProps = {
  analysis: DomainAnalysis;
};

export function MarketAlignment({ analysis }: MarketAlignmentProps) {
  return (
    <>
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--success)]" />
          <h2 className="text-base font-semibold text-[var(--on-surface)]">Signal Analysis</h2>
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--on-surface-variant)]">
          Strongest Signals
        </p>
        <ul className="space-y-2 text-sm text-[var(--on-surface-variant)]">
          {analysis.strengths.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--on-surface)]">Market Alignment</h2>
        <div className="rounded-[var(--radius-md)] bg-[var(--surface-container-low)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-[var(--secondary)]">
            <Check className="h-3.5 w-3.5" /> Ideal For
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{analysis.idealFor[0]}</p>
        </div>
        <div className="rounded-[var(--radius-md)] bg-[var(--error-container)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-[var(--error)]">
            <X className="h-3.5 w-3.5" /> Not Ideal For
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{analysis.notIdealFor[0]}</p>
        </div>
      </Card>
    </>
  );
}
