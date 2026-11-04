import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SIGNAL_MODEL, OVERALL_SCORE_NOTE } from "@/lib/guides/signal-model";
import { getSiteUrl, jsonLdString, ogBase, ORG_ID, SITE_NAME, WEBSITE_ID } from "@/lib/site";

const TITLE = "How the Domain Scores Are Calculated";
const DESCRIPTION =
  "Exactly how each domain name score is computed (Brand Strength, Marketing Clarity, Search Relevance, AI/Entity Clarity, Trust, Resale Potential, Value) and what each one does not measure.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${getSiteUrl()}/methodology` },
  openGraph: { ...ogBase(), title: TITLE, description: DESCRIPTION, type: "article", url: `${getSiteUrl()}/methodology` },
};

const card = "rounded-[var(--radius-lg)] border border-[var(--outline-variant)] bg-white p-4";
const muted = "text-[var(--on-surface-variant)]";
const link = "font-medium text-[var(--theme-primary)] underline";

export default function MethodologyPage() {
  const url = `${getSiteUrl()}/methodology`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: TITLE,
    description: DESCRIPTION,
    url,
    mainEntityOfPage: { "@id": url },
    isPartOf: { "@id": WEBSITE_ID() },
    author: { "@id": ORG_ID() },
    publisher: { "@id": ORG_ID() },
    dateModified: "2026-11-05",
    inLanguage: "en",
  };
  return (
    <PageShell headerTitle="Methodology" showSearch={false}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <article className="mx-auto max-w-3xl space-y-6 text-[var(--on-surface)]">
        <header className="space-y-3">
          <h1 className="text-2xl font-bold md:text-3xl">How the domain scores are calculated</h1>
          <p className="text-lg leading-relaxed">
            Every candidate gets seven 0–100 scores, computed from two inputs only: the domain name itself and
            the words in your search. {SITE_NAME} doesn&apos;t use traffic, backlinks, search volume or sales
            data, so read the scores as consistent rules applied to every name, not as predictions.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">The seven scores</h2>
          <dl className="space-y-3">
            {Object.values(SIGNAL_MODEL).map((s) => (
              <div key={s.key} id={s.key} className={card}>
                <dt className="font-semibold">{s.label}</dt>
                <dd className="mt-1 text-sm">{s.computedFrom}</dd>
                <dd className={`mt-1 text-sm ${muted}`}>
                  <span className="font-medium">Doesn&apos;t measure:</span> {s.limits}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">The overall score and risk</h2>
          <p>{OVERALL_SCORE_NOTE}</p>
          <p className={`text-sm ${muted}`}>
            The starting weights for each buying intent are listed in the{" "}
            <Link href="/guides/how-to-score-a-domain-name-for-branding" className={link}>
              branding scorecard guide
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">What you still have to check yourself</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              How the name sounds: run the{" "}
              <Link href="/guides/how-to-pick-a-domain-name-that-is-easy-to-say" className={link}>radio test</Link>.
            </li>
            <li>
              A used domain&apos;s past content, links and blocklist status: follow the{" "}
              <Link href="/guides/how-to-check-a-used-domains-history-before-buying" className={link}>
                history audit
              </Link>
              .
            </li>
            <li>Trademark conflicts in your category: search your national trademark register.</li>
          </ul>
        </section>
      </article>
    </PageShell>
  );
}
