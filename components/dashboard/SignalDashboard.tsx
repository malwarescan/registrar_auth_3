"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SignalMap } from "@/components/dashboard/SignalMap";
import { SignalWinnersBoard } from "@/components/dashboard/SignalWinnersBoard";
import { SignalMatrix } from "@/components/dashboard/SignalMatrix";
import { SignalControls } from "@/components/dashboard/SignalControls";
import { RankedDomainCard } from "@/components/dashboard/RankedDomainCard";
import { PinnedDomainCard } from "@/components/dashboard/PinnedDomainCard";
import { BenchmarkComparison } from "@/components/dashboard/BenchmarkComparison";
import type { AnalyzeResponse, OptimizeMode, SignalWeights } from "@/lib/types/domain";
import { DEFAULT_SIGNAL_WEIGHTS, OPTIMIZE_PRESETS } from "@/lib/types/domain";
import { buildDashboardView } from "@/lib/intelligence/dashboard";
import {
  buildBenchmarkDeltas,
  buildPinRecommendation,
  getSystemPinned,
} from "@/lib/intelligence/pinning";
import { useShortlistContext } from "@/lib/shortlist/shortlist-context";
import { domainToSlug } from "@/lib/shortlist/use-shortlist";
import { cn } from "@/lib/utils";
import {
  isBenchmarkOnly,
  isRecommendationEligible,
} from "@/lib/domains/availability";

type ResultsTab = "dashboard" | "domains" | "compare" | "details";

type SignalDashboardProps = {
  data: AnalyzeResponse;
  weights: SignalWeights;
  benchmarkDomain?: string | null;
  onBenchmarkChange?: (domain: string | null) => void;
  onWeightChange?: (key: keyof SignalWeights, value: number) => void;
};

const RESULT_TABS: { id: ResultsTab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "dashboard", label: "Dashboard" },
  { id: "domains", label: "Domains" },
  { id: "compare", label: "Compare" },
];

export function SignalDashboard({
  data,
  weights,
  benchmarkDomain,
  onBenchmarkChange,
  onWeightChange,
}: SignalDashboardProps) {
  const router = useRouter();
  const { shortlist, add, isShortlisted } = useShortlistContext();
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeGraph, setActiveGraph] = useState(0);
  const [activeTab, setActiveTab] = useState<ResultsTab>("details");

  useEffect(() => {
    setActiveTab("details");
    setActiveDomain(null);
  }, [data.query]);

  const dashboard = useMemo(
    () => buildDashboardView(data.results, weights),
    [data.results, weights]
  );

  const systemPinned = useMemo(
    () => getSystemPinned(dashboard.rankedResults, weights),
    [dashboard.rankedResults, weights]
  );

  const displayPinned = useMemo(() => {
    if (benchmarkDomain) {
      return dashboard.rankedResults.find((c) => c.domain === benchmarkDomain) ?? systemPinned;
    }
    return systemPinned;
  }, [benchmarkDomain, dashboard.rankedResults, systemPinned]);

  const pinRecommendation = useMemo(() => {
    if (!displayPinned) return null;
    return buildPinRecommendation(
      displayPinned,
      dashboard.rankedResults,
      weights,
      dashboard.rankings,
      dashboard.winners
    );
  }, [displayPinned, dashboard, weights]);

  const benchmarkDeltas = useMemo(() => {
    if (!benchmarkDomain || !displayPinned) return [];
    return buildBenchmarkDeltas(displayPinned, dashboard.rankedResults);
  }, [benchmarkDomain, displayPinned, dashboard.rankedResults]);

  const availableRecommendations = useMemo(
    () => dashboard.rankedResults.filter((c) => c.availabilityStatus === "available"),
    [dashboard.rankedResults]
  );
  const premiumMarketplace = useMemo(
    () =>
      dashboard.rankedResults.filter(
        (c) =>
          c.availabilityStatus === "premium_available" ||
          c.availabilityStatus === "marketplace_available"
      ),
    [dashboard.rankedResults]
  );
  const unavailableBenchmarks = useMemo(
    () => dashboard.candidates.filter((c) => isBenchmarkOnly(c)),
    [dashboard.candidates]
  );
  const notCheckedCandidates = useMemo(
    () =>
      dashboard.candidates.filter(
        (c) =>
          c.availabilityStatus === "idea_only" ||
          c.availabilityStatus === "unknown" ||
          c.availabilityStatus === "api_error"
      ),
    [dashboard.candidates]
  );
  const hasBuyableRecommendations = dashboard.rankedResults.some((c) =>
    isRecommendationEligible(c)
  );
  const rankByDomain = useMemo(
    () =>
      new Map(
        dashboard.rankedResults.map((c, i) => [c.domain, i + 1] as const)
      ),
    [dashboard.rankedResults]
  );

  const total = dashboard.candidates.length;
  const shortlistedSet = new Set(shortlist.map((c) => c.domain));

  const goCompare = (domains: string[]) => {
    if (domains.length < 2) return;
    router.push(
      `/compare?domains=${domains.slice(0, 3).map((d) => domainToSlug(d)).join(",")}&q=${encodeURIComponent(data.query)}`
    );
  };

  const cardProps = (c: (typeof dashboard.rankedResults)[0], i: number) => ({
    candidate: c,
    rankings: dashboard.rankings[c.domain],
    total,
    rank: i + 1,
    active: activeDomain === c.domain,
    isBenchmark: benchmarkDomain === c.domain,
    onSelect: () => setActiveDomain(c.domain),
    onShortlist: () => add(c),
    onCompare: () => goCompare([c.domain, displayPinned?.domain ?? dashboard.rankedResults[0]?.domain].filter(Boolean) as string[]),
    onPinBenchmark: () => onBenchmarkChange?.(c.domain),
    shortlisted: isShortlisted(c.domain),
  });

  const graphs = [
    {
      title: "Tradeoff Map",
      subtitle: "Brand Strength vs SEO Relevance",
      points: dashboard.graphPoints.brandVsSeo,
      xLabel: "Brand Strength",
      yLabel: "SEO Relevance",
      xDomain: [50, 100] as [number, number],
      yDomain: [50, 100] as [number, number],
      quadrantLabels: {
        topRight: "Strong brand + strong SEO",
        topLeft: "SEO-heavy exact match",
        bottomRight: "Brandable, weaker SEO",
        bottomLeft: "Weak fit",
      },
    },
    {
      title: "Price vs Trust",
      subtitle: "Does price justify trust signals?",
      points: dashboard.graphPoints.priceVsTrust,
      xLabel: "Relative Price",
      yLabel: "Trust",
      xDomain: [0, 100] as [number, number],
      yDomain: [50, 100] as [number, number],
    },
    {
      title: "AI Visibility Map",
      subtitle: "Entity Clarity vs Ambiguity Risk",
      points: dashboard.graphPoints.aiVsAmbiguity,
      xLabel: "AI Clarity",
      yLabel: "Ambiguity Risk",
      xDomain: [50, 100] as [number, number],
      yDomain: [0, 60] as [number, number],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--on-surface)] md:text-2xl">
          Results for &ldquo;{data.query}&rdquo;
        </h2>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Ranked by your strategy brief — brand, SEO, AI visibility, trust, value, and risk.
        </p>
        {data.dataSourceNote && (
          <p
            className={cn(
              "mt-2 rounded-md border px-3 py-2 text-xs leading-relaxed",
              data.dataSource === "marketplace"
                ? "border-[var(--success)]/30 bg-[var(--success-container)] text-[var(--on-surface)]"
                : "border-[var(--warning)]/40 bg-[var(--warning-container)] text-[var(--on-surface)]"
            )}
          >
            {data.dataSourceNote}
          </p>
        )}
        <div className="mt-4 flex gap-1 border-b border-[var(--outline-variant)]">
          {RESULT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-[var(--secondary)] text-[var(--secondary)]"
                  : "border-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "details" && (
        <section className="space-y-5">
          {hasBuyableRecommendations ? (
            <>
              {availableRecommendations.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
                    Available Recommendations
                  </h2>
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    {availableRecommendations.slice(0, 8).map((c) => (
                      <RankedDomainCard
                        key={c.domain}
                        {...cardProps(c, (rankByDomain.get(c.domain) ?? 1) - 1)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {premiumMarketplace.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
                    Premium / Marketplace Opportunities
                  </h2>
                  <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
                    Verified premium inventory and marketplace listings.
                  </p>
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    {premiumMarketplace.slice(0, 8).map((c) => (
                      <RankedDomainCard
                        key={c.domain}
                        {...cardProps(c, (rankByDomain.get(c.domain) ?? 1) - 1)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!availableRecommendations.length && premiumMarketplace.length > 0 && (
                <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-container)] p-4">
                  <p className="text-sm text-[var(--on-surface)]">
                    No standard registration inventory is available right now. Showing premium/marketplace options.
                  </p>
                </div>
              )}

            </>
          ) : (
            <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-container)] p-4">
              <p className="text-sm font-semibold text-[var(--on-surface)]">
                No verified available domains found yet.
              </p>
              <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                Try generating more names, including premium marketplace inventory, or broadening TLDs.
              </p>
            </div>
          )}

          {unavailableBenchmarks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
                Unavailable Benchmarks
              </h2>
              <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
                Taken domains are shown only for comparison and inspiration.
              </p>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {unavailableBenchmarks.slice(0, 6).map((c, i) => (
                  <RankedDomainCard key={c.domain} {...cardProps(c, i)} />
                ))}
              </div>
            </div>
          )}

          {notCheckedCandidates.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
                Generated But Not Checked
              </h2>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {notCheckedCandidates.slice(0, 6).map((c, i) => (
                  <RankedDomainCard key={c.domain} {...cardProps(c, i)} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {pinRecommendation && activeTab === "dashboard" && (
        <PinnedDomainCard
          recommendation={pinRecommendation}
          isUserPinned={!!benchmarkDomain}
          onPinBenchmark={() => onBenchmarkChange?.(displayPinned!.domain)}
          onShortlist={() => add(displayPinned!)}
          onCompare={() => goCompare([displayPinned!.domain, dashboard.rankedResults[1]?.domain].filter(Boolean) as string[])}
          shortlisted={isShortlisted(displayPinned!.domain)}
        />
      )}

      {benchmarkDomain && displayPinned && benchmarkDeltas.length > 0 && activeTab === "dashboard" && (
        <BenchmarkComparison
          benchmark={displayPinned}
          deltas={benchmarkDeltas}
          candidates={dashboard.rankedResults}
          onSelectDomain={setActiveDomain}
        />
      )}

      {activeTab === "dashboard" && hasBuyableRecommendations && (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
                Signal Intelligence Dashboard
              </h2>
              <div className="flex gap-1 lg:hidden">
                {graphs.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveGraph(i)}
                    className={`h-2 w-2 rounded-full ${activeGraph === i ? "bg-[var(--secondary)]" : "bg-[var(--outline-variant)]"}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-12 xl:gap-6">
              <div className="space-y-4 xl:col-span-8">
                <div className="hidden gap-4 lg:grid lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <SignalMap
                      {...graphs[0]}
                      activeDomain={activeDomain ?? displayPinned?.domain}
                      onSelectDomain={setActiveDomain}
                    />
                  </div>
                  <SignalMap {...graphs[1]} activeDomain={activeDomain} onSelectDomain={setActiveDomain} compact />
                  <SignalMap {...graphs[2]} activeDomain={activeDomain} onSelectDomain={setActiveDomain} compact />
                </div>
                <div className="lg:hidden">
                  <SignalMap
                    {...graphs[activeGraph]}
                    activeDomain={activeDomain}
                    onSelectDomain={setActiveDomain}
                  />
                </div>
              </div>
              <div className="xl:col-span-4">
                <SignalWinnersBoard
                  winners={dashboard.winners}
                  activeDomain={activeDomain}
                  onSelectDomain={setActiveDomain}
                  onCompare={(d) => goCompare([d, displayPinned?.domain ?? d])}
                />
              </div>
            </div>
          </section>

          <SignalMatrix
            candidates={dashboard.rankedResults}
            rankings={dashboard.rankings}
            activeDomain={activeDomain}
            onSelectDomain={setActiveDomain}
            onShortlist={add}
            shortlisted={shortlistedSet}
          />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
              Ranked Domain Analysis
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {dashboard.rankedResults.map((c, i) => (
                <RankedDomainCard key={c.domain} {...cardProps(c, i)} />
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "domains" && hasBuyableRecommendations && (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {dashboard.rankedResults.map((c, i) => (
              <RankedDomainCard key={c.domain} {...cardProps(c, i)} />
            ))}
          </div>
        </section>
      )}

      {activeTab === "compare" && hasBuyableRecommendations && (
        <SignalMatrix
          candidates={dashboard.rankedResults}
          rankings={dashboard.rankings}
          activeDomain={activeDomain}
          onSelectDomain={setActiveDomain}
          onShortlist={add}
          shortlisted={shortlistedSet}
        />
      )}

      <div className="xl:hidden">
        <SignalControls
          optimize="overall"
          onOptimizeChange={() => {}}
          weights={weights}
          onWeightChange={onWeightChange ?? (() => {})}
          shortlist={shortlist}
          onCompareShortlist={() => goCompare(shortlist.map((c) => c.domain))}
        />
      </div>
    </div>
  );
}

export function useSignalModel(initialMode: OptimizeMode = "overall") {
  const [optimize, setOptimize] = useState<OptimizeMode>(initialMode);
  const [weights, setWeights] = useState<SignalWeights>({ ...DEFAULT_SIGNAL_WEIGHTS });

  const handleOptimizeChange = (mode: OptimizeMode) => {
    setOptimize(mode);
    setWeights({ ...OPTIMIZE_PRESETS[mode] });
  };

  const handleWeightChange = (key: keyof SignalWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  return { optimize, weights, handleOptimizeChange, handleWeightChange };
}
