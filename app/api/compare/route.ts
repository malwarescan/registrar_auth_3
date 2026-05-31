import { NextResponse } from "next/server";
import type { CompareResponse } from "@/lib/types/domain";
import { buildCompareResponse } from "@/lib/intelligence/compare";
import { getMarketplaceListing } from "@/lib/namesilo/marketplace-client";
import { scoreDomain } from "@/lib/intelligence/score-domain";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { domains: string[]; query?: string };
    const domains = body.domains?.filter(Boolean) ?? [];
    if (domains.length < 2) {
      return NextResponse.json({ error: "At least 2 domains required" }, { status: 400 });
    }

    const query = body.query ?? "Eco Home Tech";
    const candidates = await Promise.all(
      domains.map(async (d) => {
        const listing = await getMarketplaceListing(d, query);
        return listing ?? scoreDomain(d, query, 99, "marketplace", true);
      })
    );

    const response: CompareResponse = buildCompareResponse(candidates);
    return NextResponse.json(response);
  } catch (err) {
    console.error("[compare]", err);
    return NextResponse.json({ error: "Compare failed" }, { status: 500 });
  }
}
