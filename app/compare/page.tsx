import { Suspense } from "react";
import type { Metadata } from "next";
import { ComparePageClient } from "@/components/compare/ComparePageClient";
import { getSiteUrl } from "@/lib/guides/schema";

export const metadata: Metadata = {
  title: "Competitive Domain Analysis | NameSilo Intelligence",
  description: "Compare domains side-by-side with brand, SEO, and AI signal rankings.",
  alternates: { canonical: `${getSiteUrl()}/compare` },
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm">Loading...</div>}>
      <ComparePageClient />
    </Suspense>
  );
}
