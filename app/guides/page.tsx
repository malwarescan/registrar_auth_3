import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { GUIDES } from "@/lib/guides/guides";
import { guidesIndexJsonLd } from "@/lib/guides/schema";
import { getSiteUrl, jsonLdString, ogBase } from "@/lib/site";

const DESCRIPTION =
  "Decision guides for choosing a domain name: how to score names for branding, what makes a domain valuable, what to do when your name is taken, and how to audit a used domain's history, and where AI assistants fit in.";

export function generateMetadata(): Metadata {
  const url = `${getSiteUrl()}/guides`;
  return {
    title: "Domain Name Decision Guides",
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: { ...ogBase(), title: "Domain Name Decision Guides", description: DESCRIPTION, type: "website", url },
  };
}

export default function GuidesIndexPage() {
  return (
    <PageShell headerTitle="Guides" showSearch={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(guidesIndexJsonLd(GUIDES)) }}
      />
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--on-surface)] md:text-3xl">
            Domain name decision guides
          </h1>
          <p className="text-[var(--on-surface-variant)]">
            Practical frameworks for choosing a domain: what to score, how to weigh trade-offs, and when
            to walk away. Each guide answers one question and says which checks the scores can&apos;t do
            for you. The formulas behind every score are on the{" "}
            <Link href="/methodology" className="font-medium text-[var(--theme-primary)] underline">
              methodology page
            </Link>
            .
          </p>
        </header>
        <ul className="grid gap-3">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-[var(--radius-lg)] border border-[var(--outline-variant)] bg-white p-4 transition-colors hover:bg-[var(--surface-container-low)]"
              >
                <h2 className="font-semibold text-[var(--theme-primary)]">{g.question}</h2>
                <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{g.metaDescription}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-[var(--on-surface-variant)]">
          Ready to try it?{" "}
          <Link href="/" className="font-medium text-[var(--theme-primary)] underline">
            Search and score domain names
          </Link>{" "}
          or{" "}
          <Link href="/compare" className="font-medium text-[var(--theme-primary)] underline">
            compare your shortlist
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
