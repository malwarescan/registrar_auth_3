import { NextResponse } from "next/server";
import { getMarketplaceListing } from "@/lib/namesilo/marketplace-client";
import { checkRegisterAvailability } from "@/lib/namesilo/public-api-client";
import { scoreDomain } from "@/lib/intelligence/score-domain";
import { slugToDomain } from "@/lib/domains/slug";

type RouteParams = { params: Promise<{ name: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { name } = await params;
    const domain = slugToDomain(name);
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "Eco Home Tech";

    let candidate = await getMarketplaceListing(domain, query);
    if (!candidate) {
      candidate = {
        ...scoreDomain(domain, query, 49.99, "registration", false),
        availabilityStatus: "unknown",
        available: false,
      };
    }

    const availability = await checkRegisterAvailability([domain]);
    const isRegistrationAvailable = availability[domain] ?? candidate.available;
    candidate = {
      ...candidate,
      available: isRegistrationAvailable,
      availabilityStatus: isRegistrationAvailable
        ? candidate.availabilityStatus
        : candidate.availabilityStatus === "marketplace_available" ||
            candidate.availabilityStatus === "premium_available"
          ? candidate.availabilityStatus
          : "taken",
    };

    return NextResponse.json(candidate);
  } catch (err) {
    console.error("[domain]", err);
    return NextResponse.json({ error: "Domain lookup failed" }, { status: 500 });
  }
}
