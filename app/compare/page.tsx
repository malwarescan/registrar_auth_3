import { Suspense } from "react";
import type { Metadata } from "next";
import { ComparePageClient } from "@/components/compare/ComparePageClient";

export const metadata: Metadata = {
  title: "Competitive Domain Analysis | NameSilo Intelligence",
  description: "Compare domains side-by-side with brand, SEO, and AI signal rankings.",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm">Loading...</div>}>
      <ComparePageClient />
    </Suspense>
  );
}
