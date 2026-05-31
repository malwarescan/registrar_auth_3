import type { Metadata } from "next";
import { SearchPageClient } from "@/components/search/SearchPageClient";

export const metadata: Metadata = {
  title: "NameSilo Intelligence — Domain Signal Search",
  description:
    "Professional NameSilo Marketplace with integrated domain signal intelligence for brand, SEO, and AI visibility.",
  openGraph: {
    title: "NameSilo Intelligence",
    description:
      "Discover domains with data-driven brand, SEO, and AI visibility signals.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <section className="sr-only">
        <h1>NameSilo Intelligence — Domain Discovery</h1>
        <p>
          Search and analyze domain names with integrated signal intelligence for brand strength,
          SEO relevance, and AI visibility.
        </p>
      </section>
      <SearchPageClient />
    </>
  );
}
