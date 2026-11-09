import type { Metadata } from "next";
import Link from "next/link";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import { getSiteUrl, ogBase, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const TITLE = `Domain Name Scoring and Comparison | ${SITE_NAME}`;

export const metadata: Metadata = {
  alternates: { canonical: `${getSiteUrl()}/` },
  // The root title template doesn't apply to the root segment, so set the full title here.
  title: { absolute: TITLE },
  description: SITE_DESCRIPTION,
  openGraph: {
    ...ogBase(),
    title: TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: `${getSiteUrl()}/`,
  },
};

const link = "font-medium text-[var(--theme-primary)] underline";

/** Maps the common naming situations to the guide that answers them. */
const DECISION_GUIDES = [
  {
    situation: "Naming a new company",
    href: "/guides/how-to-shortlist-domain-names-for-a-new-company",
    label: "Go from 40 ideas to one domain in seven steps",
  },
  {
    situation: "Choosing how much brand vs SEO matters",
    href: "/guides/how-to-score-a-domain-name-for-branding",
    label: "Set scorecard weights before you look at names",
  },
  {
    situation: "Paying a premium price",
    href: "/guides/what-signals-make-a-domain-name-valuable",
    label: "Separate use value from resale value",
  },
  {
    situation: "Buying a domain someone used before",
    href: "/guides/how-to-check-a-used-domains-history-before-buying",
    label: "Audit its history, links and blocklist status",
  },
  {
    situation: "Your first choice is taken",
    href: "/guides/alternatives-when-the-domain-name-you-want-is-taken",
    label: "Buy it, backorder it or pick an alternative",
  },
  {
    situation: "Wanting AI assistants to name you",
    href: "/guides/how-do-ai-assistants-choose-which-brand-to-recommend",
    label: "See how small a part the domain plays, and what matters more",
  },
];

function HomeIntro() {
  return (
    <header className="mb-6 max-w-3xl space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--on-surface)] md:text-3xl">
        {SITE_NAME}: score and compare domain names for brand, SEO and AI clarity
      </h1>
      <p className="leading-relaxed text-[var(--on-surface-variant)]">
        Describe what you are building and why you are buying a domain. {SITE_NAME} generates candidate
        names, checks which ones you can actually register or buy, and scores each one 0–100 on brand
        strength, search relevance, AI/entity clarity, extension trust, resale potential and value for
        money. The weights follow your buying intent, so a local plumber and a SaaS startup get different
        rankings from the same list. Scores come from the name itself, not traffic data:{" "}
        <Link href="/methodology" className={link}>see how each score is calculated</Link>, or read the{" "}
        <Link href="/guides" className={link}>domain name decision guides</Link> first.
      </p>
    </header>
  );
}

function HomeGuides() {
  return (
    <section aria-labelledby="home-guides" className="space-y-3">
      <h2 id="home-guides" className="text-base font-semibold text-[var(--on-surface)]">
        Guides for the decision you are making
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DECISION_GUIDES.map((g) => (
          <li
            key={g.href}
            className="rounded-[var(--radius-lg)] border border-[var(--outline-variant)] bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
              {g.situation}
            </p>
            <Link href={g.href} className={`mt-1 block text-sm ${link}`}>
              {g.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <Link href="/guides" className={link}>Browse all domain name guides</Link>
        {" · "}
        <Link href="/compare" className={link}>Compare a shortlist side by side</Link>
      </p>
    </section>
  );
}

export default function HomePage() {
  return <SearchPageClient intro={<HomeIntro />} guides={<HomeGuides />} />;
}
