import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ComparePageClient, EXAMPLE_HREF } from "@/components/compare/ComparePageClient";
import { getSiteUrl, ogBase } from "@/lib/site";

const TITLE = "Compare Domain Names Side by Side";
const DESCRIPTION =
  "Put two or three domain names next to each other and see which one wins on brand strength, search relevance, AI/entity clarity, trust, resale and value for money, and what each choice costs you.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${getSiteUrl()}/compare` },
  openGraph: { ...ogBase(), title: TITLE, description: DESCRIPTION, type: "website", url: `${getSiteUrl()}/compare` },
};

const link = "font-medium text-[var(--theme-primary)] underline";
const muted = "text-[var(--on-surface-variant)]";

export default function ComparePage() {
  return (
    <PageShell headerTitle="Compare" backHref="/">
      <div className="space-y-6">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-2xl font-bold text-[var(--on-surface)] md:text-3xl">
            Compare domain names side by side
          </h1>
          <p className={`leading-relaxed ${muted}`}>
            A comparison answers one question: of the two or three names you are still considering, which is
            the best trade-off for your business? Each name is scored against the same search words, so the
            numbers are directly comparable. The page shows three views of the same data.
          </p>
          <ul className={`list-disc space-y-1 pl-6 text-sm ${muted}`}>
            <li>
              <strong className="text-[var(--on-surface)]">Trade-off map</strong>: plots Brand Strength against
              Search Relevance, so you can see whether each finalist is a brand-style name or a keyword-style one.
            </li>
            <li>
              <strong className="text-[var(--on-surface)]">Comparison matrix</strong>: ranks the names 1–3 on
              brand, SEO and AI/entity clarity, so a name that leads on one signal but trails on the others is easy
              to spot.
            </li>
            <li>
              <strong className="text-[var(--on-surface)]">Decision summary</strong>: three ways to choose (brand
              focus, search and value focus, or the best balance) and which name wins under each, with a buy link
              when the winner can be registered or bought now.
            </li>
          </ul>
          <p className={`text-sm ${muted}`}>
            Scores are heuristics computed from the name and your query, not traffic or appraisal data.{" "}
            <Link href="/methodology" className={link}>Read how each score is calculated</Link>. Not sure which
            names belong in the comparison yet? Start with{" "}
            <Link href="/guides/how-to-shortlist-domain-names-for-a-new-company" className={link}>
              how to shortlist domain names
            </Link>
            , set your priorities with the{" "}
            <Link href="/guides/how-to-score-a-domain-name-for-branding" className={link}>
              branding scorecard weights
            </Link>
            , or, if a finalist was used before, run the{" "}
            <Link href="/guides/how-to-check-a-used-domains-history-before-buying" className={link}>
              used-domain history audit
            </Link>{" "}
            before you buy.
          </p>
          <p className="text-sm">
            <Link href={EXAMPLE_HREF} className={link}>
              Open the example: brightnest.com vs smartecohome.com vs ecohometech.net
            </Link>
          </p>
        </header>

        <Suspense fallback={<p className={`text-sm ${muted}`}>Loading your comparison…</p>}>
          <ComparePageClient />
        </Suspense>
      </div>
    </PageShell>
  );
}
