import { NextResponse } from "next/server";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types/domain";
import { pickDecisionStack, sortByOptimizeMode } from "@/lib/intelligence/score-domain";
import { searchMarketplace } from "@/lib/namesilo/marketplace-client";
import { checkRegisterAvailability } from "@/lib/namesilo/public-api-client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const { candidates } = await searchMarketplace(query, body.filters);

    const domains = candidates.map((c) => c.domain);
    const availability = await checkRegisterAvailability(domains);
    const enriched = candidates.map((c) => ({
      ...c,
      available: availability[c.domain] ?? c.available,
    }));

    if (enriched.length === 0) {
      return NextResponse.json({
        query,
        results: [],
        decisionStack: null,
      });
    }

    const sorted = sortByOptimizeMode(enriched, "overall");
    const decisionStack = pickDecisionStack(enriched);

    const response: AnalyzeResponse = {
      query,
      results: sorted,
      decisionStack,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
