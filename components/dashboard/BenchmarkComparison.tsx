"use client";

import Link from "next/link";
import { Pin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { BenchmarkDelta } from "@/lib/types/domain-brief";
import type { DomainCandidate } from "@/lib/types/domain";
import { findBetterThanBenchmark } from "@/lib/intelligence/pinning";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";
import { cn } from "@/lib/utils";

type BenchmarkComparisonProps = {
  benchmark: DomainCandidate;
  deltas: BenchmarkDelta[];
  candidates: DomainCandidate[];
  onSelectDomain?: (domain: string) => void;
  onOptimizeRequest?: (mode: "brand" | "seo" | "ai" | "value") => void;
};

function DeltaCell({ value }: { value: number }) {
  if (Math.abs(value) < 3) return <span className="text-[var(--on-surface-variant)]">—</span>;
  return (
    <span className={cn("font-semibold tabular-nums", value > 0 ? "text-[var(--success)]" : "text-[var(--error)]")}>
      {value > 0 ? `+${value}` : value}
    </span>
  );
}

export function BenchmarkComparison({
  benchmark,
  deltas,
  candidates,
  onSelectDomain,
  onOptimizeRequest,
}: BenchmarkComparisonProps) {
  const betterOptions = [
    { label: "Better brand option", dim: "brand" as const, candidate: findBetterThanBenchmark(benchmark, candidates, "brand") },
    { label: "Better SEO option", dim: "seo" as const, candidate: findBetterThanBenchmark(benchmark, candidates, "seo") },
    { label: "Better AI clarity option", dim: "ai" as const, candidate: findBetterThanBenchmark(benchmark, candidates, "ai") },
    { label: "Better trust option", dim: "trust" as const, candidate: findBetterThanBenchmark(benchmark, candidates, "trust") },
    { label: "Better value option", dim: "value" as const, candidate: findBetterThanBenchmark(benchmark, candidates, "value") },
  ].filter((o) => o.candidate);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Pin className="h-4 w-4 text-[var(--secondary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
          Comparing against benchmark: {benchmark.domain}
        </h2>
      </div>

      {betterOptions.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {betterOptions.map(({ label, dim, candidate }) =>
            candidate ? (
              <button
                key={label}
                type="button"
                onClick={() => {
                  onOptimizeRequest?.(dim === "trust" ? "brand" : dim);
                  onSelectDomain?.(candidate.domain);
                }}
                className="rounded-lg border border-[var(--outline-variant)] bg-white px-3 py-2 text-left hover:border-[var(--secondary)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--secondary)]">{label}</p>
                <p className="font-semibold text-[var(--on-surface)]">{candidate.domain}</p>
              </button>
            ) : null
          )}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
                <th className="px-4 py-2.5">Domain</th>
                <th className="px-2 py-2.5 text-center">Brand</th>
                <th className="px-2 py-2.5 text-center">SEO</th>
                <th className="px-2 py-2.5 text-center">AI</th>
                <th className="px-2 py-2.5 text-center">Trust</th>
                <th className="px-2 py-2.5 text-center">Price Δ</th>
              </tr>
            </thead>
            <tbody>
              {deltas.slice(0, 8).map((d) => (
                <tr
                  key={d.domain}
                  className="cursor-pointer border-b border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)]"
                  onClick={() => onSelectDomain?.(d.domain)}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/domain/${domainToSlug(d.domain)}`}
                      className="font-semibold text-[var(--on-surface)] hover:text-[var(--secondary)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {d.domain}
                    </Link>
                    <p className="text-xs text-[var(--on-surface-variant)]">{d.summary}</p>
                  </td>
                  <td className="px-2 py-3 text-center"><DeltaCell value={d.brand} /></td>
                  <td className="px-2 py-3 text-center"><DeltaCell value={d.seo} /></td>
                  <td className="px-2 py-3 text-center"><DeltaCell value={d.ai} /></td>
                  <td className="px-2 py-3 text-center"><DeltaCell value={d.trust} /></td>
                  <td className="px-2 py-3 text-center text-xs tabular-nums">
                    {d.priceDiff > 0 ? `+$${d.priceDiff.toLocaleString()}` : d.priceDiff < 0 ? `-$${Math.abs(d.priceDiff).toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
