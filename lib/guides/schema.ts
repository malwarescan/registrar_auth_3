import type { Guide } from "./guides";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://namemog.com").replace(/\/$/, "");
}

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const PUBLISHER = { "@type": "Organization", name: "NameMog", url: "https://namemog.com" };

export function guideJsonLd(guide: Guide) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/guides/${guide.slug}`;
  const publisher = { ...PUBLISHER, url: siteUrl };

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.question,
      description: guide.metaDescription,
      datePublished: guide.datePublished,
      dateModified: guide.dateModified,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      author: publisher,
      publisher,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guides` },
        { "@type": "ListItem", position: 3, name: guide.question, item: url },
      ],
    },
  ];
}

export function guidesIndexJsonLd(guides: Guide[]) {
  const siteUrl = getSiteUrl();
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Domain name decision guides",
      url: `${siteUrl}/guides`,
      hasPart: guides.map((g) => ({
        "@type": "Article",
        headline: g.question,
        url: `${siteUrl}/guides/${g.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guides` },
      ],
    },
  ];
}
