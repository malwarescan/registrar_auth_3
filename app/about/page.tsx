import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { getSiteUrl, jsonLdString, ogBase, OPERATOR, ORG_ID, SITE_NAME, WEBSITE_ID } from "@/lib/site";

const TITLE = `About ${SITE_NAME}: Domain Name Scoring Run by ${OPERATOR.name}`;
const DESCRIPTION = `${SITE_NAME} is a domain name scoring and comparison tool run by ${OPERATOR.name}. What it does, where its data comes from and what its scores can't tell you.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${getSiteUrl()}/about` },
  openGraph: { ...ogBase(), title: TITLE, description: DESCRIPTION, type: "website", url: `${getSiteUrl()}/about` },
};

const link = "font-medium text-[var(--theme-primary)] underline";

export default function AboutPage() {
  const url = `${getSiteUrl()}/about`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": url,
    url,
    name: `About ${SITE_NAME}`,
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@id": ORG_ID() },
    inLanguage: "en",
  };
  return (
    <PageShell headerTitle="About" showSearch={false}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <article className="mx-auto max-w-3xl space-y-6 text-[var(--on-surface)]">
        <header className="space-y-3">
          <h1 className="text-2xl font-bold md:text-3xl">About {SITE_NAME}</h1>
          <p className="text-lg leading-relaxed">
            {SITE_NAME} is run by{" "}
            <a href={OPERATOR.url} rel="noopener" className={link}>{OPERATOR.name}</a>, an ICANN-accredited
            domain registrar. It helps you choose a domain name: describe what you are building, and it
            generates candidates, checks which ones can be registered or bought, and scores each one for brand
            strength, search relevance, AI/entity clarity, trust, resale potential and value for money.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Where the data comes from</h2>
          <p>
            Availability and prices come from {OPERATOR.name}, and buy links go to {OPERATOR.name}&apos;s
            registration or marketplace pages. The scores are calculated by {SITE_NAME} from the name itself and
            the words in your search. They are not traffic, ranking or appraisal data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">What the scores can&apos;t tell you</h2>
          <p>
            No score here listens to a name, searches trademark registers or reads a domain&apos;s history. The
            guides say plainly which checks you still have to do yourself, and the{" "}
            <Link href="/methodology" className={link}>methodology page</Link> lists every formula.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold">Start here</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><Link href="/" className={link}>Search and score domain names</Link></li>
            <li><Link href="/compare" className={link}>Compare a shortlist side by side</Link></li>
            <li><Link href="/guides" className={link}>Read the domain name decision guides</Link></li>
          </ul>
        </section>
      </article>
    </PageShell>
  );
}
