import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SignalBars } from "@/components/report/SignalBars";
import { MarketAlignment } from "@/components/report/MarketAlignment";
import { RecommendedAction } from "@/components/report/RecommendedAction";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getMarketplaceListing } from "@/lib/namesilo/marketplace-client";
import { getBuyUrl } from "@/lib/namesilo/public-api-client";
import { scoreDomain } from "@/lib/intelligence/score-domain";
import { slugToDomain, domainToSlug } from "@/lib/shortlist/use-shortlist";
import { DomainReportActions } from "@/components/report/DomainReportActions";

type PageProps = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string }>;
};

async function getDomainData(slug: string, query: string) {
  const domain = slugToDomain(slug);
  const listing = await getMarketplaceListing(domain, query);
  return listing ?? scoreDomain(domain, query, 49.99, "registration", true);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const { q } = await searchParams;
  const domain = slugToDomain(name);
  const candidate = await getDomainData(name, q ?? "Eco Home Tech");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intel.namesilo.com";

  return {
    title: `${domain} — Domain Signal Report | NameSilo Intelligence`,
    description: `Signal analysis for ${domain}: brand ${candidate.signals.brand}, SEO ${candidate.signals.search}, AI ${candidate.signals.ai}. ${candidate.analysis.recommendedAction}`,
    alternates: { canonical: `${siteUrl}/domain/${name}` },
    openGraph: {
      title: `${domain} Domain Signal Report`,
      description: candidate.analysis.recommendedAction,
      type: "article",
      url: `${siteUrl}/domain/${name}`,
    },
  };
}

export default async function DomainReportPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const { q } = await searchParams;
  const query = q ?? "Eco Home Tech";
  const candidate = await getDomainData(name, query);
  const buyUrl = getBuyUrl(candidate.domain, candidate.priceType);
  const comAlt = candidate.domain.replace(/\.[^.]+$/, ".com");
  const comSlug = domainToSlug(comAlt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: candidate.domain,
    description: candidate.analysis.recommendedAction,
    offers: {
      "@type": "Offer",
      price: candidate.price,
      priceCurrency: "USD",
      availability: candidate.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <PageShell
      headerTitle="NameSilo Intelligence"
      showLogo
      showSearch={false}
      rightSidebar={<SignalBars signals={candidate.signals} />}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-[var(--on-surface)] md:text-3xl">{candidate.domain}</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">Domain Signal Report</p>
          <p className="mt-2 text-xl font-bold tabular-nums md:text-2xl">
            ${candidate.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            {candidate.priceType === "registration" && (
              <span className="text-base font-normal text-[var(--on-surface-variant)]">/yr</span>
            )}
          </p>
          {candidate.available && (
            <Badge variant="primary" className="mt-2">
              Available Now
            </Badge>
          )}
        </header>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:flex-col">
          <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="sm:flex-1 xl:w-full">
            <Button className="w-full">Buy Now</Button>
          </a>
          <Link href={`/compare?domains=${name},${comSlug}&q=${encodeURIComponent(query)}`} className="sm:flex-1 xl:w-full">
            <Button variant="outline" className="w-full">
              Compare against .com
            </Button>
          </Link>
          <DomainReportActions candidate={candidate} />
        </div>

        <div className="xl:hidden">
          <SignalBars signals={candidate.signals} />
        </div>
        <MarketAlignment analysis={candidate.analysis} />
        <RecommendedAction text={candidate.analysis.recommendedAction} />
      </article>
    </PageShell>
  );
}
