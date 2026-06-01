import { NextResponse } from "next/server";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types/domain";
import { pickDecisionStack, sortByOptimizeMode } from "@/lib/intelligence/score-domain";
import { searchMarketplace } from "@/lib/namesilo/marketplace-client";
import {
  buildAnalysisQuery,
  briefToFilters,
  deriveWeightsFromBrief,
} from "@/lib/intelligence/brief-to-weights";
import { mergeBrief } from "@/lib/search/brief-config";
import { resolveBuyingIntent } from "@/lib/types/domain-brief";
import {
  isBenchmarkOnly,
  isRecommendationEligible,
} from "@/lib/domains/availability";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    const brief = body.brief
      ? mergeBrief(body.brief)
      : mergeBrief({ naming: body.query ?? "", buyingIntent: "business_brand" });

    const query = buildAnalysisQuery(brief).trim();
    if (!query) {
      return NextResponse.json({ error: "Tell us what you are building" }, { status: 400 });
    }

    if (!brief.buyingIntent && !brief.searchGoal) {
      return NextResponse.json({ error: "Select a buying intent first" }, { status: 400 });
    }

    const weights = body.weights ?? deriveWeightsFromBrief(brief);
    const filters = body.filters ?? briefToFilters(brief);

    const { candidates, dataSource, dataSourceNote, apiConfigured, generationMeta } =
      await searchMarketplace(brief, filters);

    if (candidates.length === 0) {
      return NextResponse.json({
        query,
        results: [],
        decisionStack: null,
        dataSource,
        dataSourceNote,
        apiConfigured,
        brief,
      });
    }

    const rankPool = candidates.filter((c) => isRecommendationEligible(c));
    const unavailableBenchmarks = candidates.filter((c) => isBenchmarkOnly(c)).slice(0, 8);
    const notChecked = candidates.filter(
      (c) =>
        c.availabilityStatus === "idea_only" ||
        c.availabilityStatus === "unknown" ||
        c.availabilityStatus === "api_error"
    );
    const displayResults = [
      ...sortByOptimizeMode(rankPool, "overall", weights),
      ...sortByOptimizeMode(unavailableBenchmarks, "overall", weights),
      ...sortByOptimizeMode(notChecked, "overall", weights),
    ];
    // Dedupe display list
    const seen = new Set<string>();
    const merged = displayResults.filter((c) => {
      const k = c.domain.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const sorted = merged;
    const intent = resolveBuyingIntent(brief);
    const decisionStack =
      rankPool.length > 0 ? pickDecisionStack(rankPool, { weights, intent }) : null;

    const response: AnalyzeResponse & { apiConfigured?: boolean; brief?: typeof brief } = {
      query,
      results: sorted,
      decisionStack,
      dataSource,
      dataSourceNote,
      apiConfigured,
      brief,
      ...(generationMeta ? { generationMeta } : {}),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
