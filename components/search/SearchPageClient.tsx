"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { SignalDashboard } from "@/components/dashboard/SignalDashboard";
import { SignalControls } from "@/components/dashboard/SignalControls";
import { SearchHeroPanel } from "@/components/search/SearchHeroPanel";
import { SearchLaunchpad } from "@/components/search/SearchLaunchpad";
import { SearchAnalyzing } from "@/components/search/SearchAnalyzing";
import { NoStrongMatches } from "@/components/search/NoStrongMatches";
import { QuickStartRail } from "@/components/search/QuickStartRail";
import type { AnalyzeResponse, OptimizeMode } from "@/lib/types/domain";
import { OPTIMIZE_PRESETS } from "@/lib/types/domain";
import { DEFAULT_BRIEF, type DomainBrief } from "@/lib/types/domain-brief";
import {
  applyBriefRequirements,
  briefToFilters,
  buildAnalysisQuery,
  deriveWeightsFromBrief,
} from "@/lib/intelligence/brief-to-weights";
import { mergeBrief } from "@/lib/search/brief-config";
import type { StartingPath } from "@/lib/search/search-config";
import { useRecentSearches } from "@/lib/search/recent-searches";
import { useShortlistContext } from "@/lib/shortlist/shortlist-context";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";

export function SearchPageClient() {
  const router = useRouter();
  const { shortlist } = useShortlistContext();
  const { recent, addRecent } = useRecentSearches();

  const [brief, setBrief] = useState<DomainBrief>(DEFAULT_BRIEF);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [benchmarkDomain, setBenchmarkDomain] = useState<string | null>(null);
  const [optimizeMode, setOptimizeMode] = useState<OptimizeMode>("overall");

  const weights = useMemo(() => deriveWeightsFromBrief(brief), [brief]);

  const handleOptimizeChange = useCallback((mode: OptimizeMode) => {
    setOptimizeMode(mode);
    setBrief((b) => ({
      ...b,
      priorityWeights: { ...OPTIMIZE_PRESETS[mode] },
    }));
  }, []);

  const analyze = useCallback(
    async (overrideBrief?: DomainBrief) => {
      const b = overrideBrief ?? brief;
      const q = buildAnalysisQuery(b).trim();
      if (!q || !b.buyingIntent) return;
      setBrief(b);
      setLoading(true);
      setError(null);
      setBenchmarkDomain(null);
      setOptimizeMode("overall");
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: b,
            filters: briefToFilters(b),
            weights: deriveWeightsFromBrief(b),
          }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          setError(err.error ?? "Analysis failed. Please try again.");
          return;
        }
        const result = (await res.json()) as AnalyzeResponse;
        result.results = applyBriefRequirements(result.results, b);
        setData(result);
        addRecent(q);
      } catch {
        setError("Could not reach the analysis service.");
      } finally {
        setLoading(false);
      }
    },
    [brief, addRecent]
  );

  const handleExampleBrief = (partial: Partial<DomainBrief>) => {
    setBrief(mergeBrief(partial));
  };

  const handlePathSelect = (path: StartingPath) => {
    const merged = mergeBrief({
      naming: path.query,
      searchMode: path.mode,
      buyingIntent: "business_brand",
    });
    setBrief(merged);
    void analyze(merged);
  };

  const handleRecentSelect = (q: string) => {
    const merged = { ...brief, naming: q };
    setBrief(merged);
    void analyze(merged);
  };

  const isEmpty = !data && !loading && !error;
  const hasResults = data && data.results.length > 0;

  const rightSidebar = hasResults ? (
    <SignalControls
      optimize={optimizeMode}
      onOptimizeChange={handleOptimizeChange}
      weights={weights}
      onWeightChange={(key, value) =>
        setBrief((b) => ({
          ...b,
          priorityWeights: { ...b.priorityWeights, [key]: value },
        }))
      }
      shortlist={shortlist}
      onCompareShortlist={() => {
        if (shortlist.length >= 2) {
          router.push(
            `/compare?domains=${shortlist.slice(0, 3).map((c) => domainToSlug(c.domain)).join(",")}&q=${encodeURIComponent(brief.naming)}`
          );
        }
      }}
    />
  ) : undefined;

  return (
    <PageShell rightSidebar={rightSidebar} fullWidth={!!hasResults}>
      <div className="mx-auto w-full max-w-[var(--container-max)]">
        {isEmpty ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_280px] xl:gap-8">
            <div className="min-w-0 space-y-8">
              <SearchHeroPanel
                brief={brief}
                onBriefChange={setBrief}
                onAnalyze={() => void analyze()}
                loading={loading}
                onExampleBrief={handleExampleBrief}
              />
              <SearchLaunchpad onExampleBrief={handleExampleBrief} />
            </div>
            <QuickStartRail
              recent={recent}
              onPathSelect={handlePathSelect}
              onRecentSelect={handleRecentSelect}
              className="hidden xl:block"
            />
            <QuickStartRail
              recent={recent}
              onPathSelect={handlePathSelect}
              onRecentSelect={handleRecentSelect}
              className="xl:hidden"
            />
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <SearchHeroPanel
              brief={brief}
              onBriefChange={setBrief}
              onAnalyze={() => void analyze()}
              loading={loading}
              compact
              onExampleBrief={handleExampleBrief}
            />

            {loading && <SearchAnalyzing query={buildAnalysisQuery(brief)} />}

            {error && (
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error-container)] px-4 py-3">
                <p className="text-sm text-[var(--error)]">{error}</p>
              </div>
            )}

            {hasResults && (
              <SignalDashboard
                data={data}
                weights={weights}
                optimize={optimizeMode}
                onOptimizeChange={handleOptimizeChange}
                benchmarkDomain={benchmarkDomain}
                onBenchmarkChange={setBenchmarkDomain}
                onWeightChange={(key, value) =>
                  setBrief((b) => ({
                    ...b,
                    priorityWeights: { ...b.priorityWeights, [key]: value },
                  }))
                }
              />
            )}

            {data && data.results.length === 0 && !loading && (
              <NoStrongMatches
                query={data.query}
                onRetryPath={(mode: OptimizeMode) => {
                  handleOptimizeChange(mode);
                  void analyze();
                }}
              />
            )}
          </div>
        )}

        {isEmpty && loading && <SearchAnalyzing query={buildAnalysisQuery(brief)} />}
        {isEmpty && error && (
          <div className="mt-4 rounded-lg border border-[var(--error)]/30 bg-[var(--error-container)] px-4 py-3">
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
