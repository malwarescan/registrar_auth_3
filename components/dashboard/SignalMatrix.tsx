"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { DomainCandidate, DomainRankings } from "@/lib/types/domain";
import { riskLabel } from "@/lib/intelligence/dashboard";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";
import { cn } from "@/lib/utils";

type SignalMatrixProps = {
  candidates: DomainCandidate[];
  rankings: Record<string, DomainRankings>;
  activeDomain?: string | null;
  onSelectDomain?: (domain: string) => void;
  onShortlist?: (candidate: DomainCandidate) => void;
  shortlisted?: Set<string>;
};

function ScoreCell({ value, rank }: { value: number; rank?: number }) {
  const isTop = rank === 1;
  return (
    <td className="px-2 py-3 text-center">
      <span
        className={cn(
          "inline-flex min-w-[2rem] flex-col items-center text-sm font-semibold tabular-nums",
          isTop ? "text-[var(--secondary)]" : "text-[var(--on-surface)]"
        )}
      >
        {value}
        {rank !== undefined && (
          <span className="text-[10px] font-normal text-[var(--on-surface-variant)]">#{rank}</span>
        )}
      </span>
    </td>
  );
}

export function SignalMatrix({
  candidates,
  rankings,
  activeDomain,
  onSelectDomain,
  onShortlist,
  shortlisted,
}: SignalMatrixProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--outline-variant)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--on-surface)]">Domain Comparison Matrix</h2>
        <p className="text-xs text-[var(--on-surface-variant)]">
          Side-by-side signal scores with relative rankings
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
              <th className="px-4 py-2.5">Domain</th>
              <th className="px-2 py-2.5 text-center">Price</th>
              <th className="px-2 py-2.5 text-center">Brand</th>
              <th className="px-2 py-2.5 text-center">SEO</th>
              <th className="px-2 py-2.5 text-center">AI</th>
              <th className="px-2 py-2.5 text-center">Trust</th>
              <th className="px-2 py-2.5 text-center">Value</th>
              <th className="px-2 py-2.5 text-center">Resale</th>
              <th className="px-2 py-2.5 text-center">Risk</th>
              <th className="px-4 py-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const r = rankings[c.domain];
              if (!r) return null;
              const risk = c.riskScore ?? 30;
              return (
                <tr
                  key={c.domain}
                  className={cn(
                    "border-b border-[var(--outline-variant)] transition-colors last:border-0 hover:bg-[var(--surface-container-low)]",
                    activeDomain === c.domain && "bg-[var(--surface-container-low)]"
                  )}
                  onClick={() => onSelectDomain?.(c.domain)}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/domain/${domainToSlug(c.domain)}`}
                      className="font-semibold text-[var(--on-surface)] hover:text-[var(--secondary)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.domain}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-center font-semibold tabular-nums">
                    ${c.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <ScoreCell value={c.signals.brand} rank={r.brand} />
                  <ScoreCell value={c.signals.search} rank={r.seo} />
                  <ScoreCell value={c.signals.ai} rank={r.ai} />
                  <ScoreCell value={c.signals.trust} rank={r.trust} />
                  <ScoreCell value={Math.round(c.valueScore ?? 0)} rank={r.value} />
                  <ScoreCell value={c.signals.resale} rank={r.resale} />
                  <td className="px-2 py-3 text-center">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        risk <= 30 && "bg-[var(--success-container)] text-[#065f46]",
                        risk > 30 && risk <= 50 && "bg-[var(--warning-container)] text-[#92400e]",
                        risk > 50 && "bg-[var(--error-container)] text-[var(--error)]"
                      )}
                    >
                      {riskLabel(risk)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShortlist?.(c);
                      }}
                      disabled={shortlisted?.has(c.domain)}
                    >
                      {shortlisted?.has(c.domain) ? "Saved" : "Shortlist"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
