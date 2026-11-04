import type { Guide } from "./guides";
import { getSiteUrl, jsonLdString, ORG_ID, WEBSITE_ID, OG_IMAGE } from "@/lib/site";

export { getSiteUrl, jsonLdString };

export function guideJsonLd(guide: Guide) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/guides/${guide.slug}`;
  const org = { "@id": ORG_ID() };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: guide.question,
        isPartOf: { "@id": WEBSITE_ID() },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        inLanguage: "en",
      },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: guide.question,
        description: guide.metaDescription,
        datePublished: guide.datePublished,
        dateModified: guide.dateModified,
        mainEntityOfPage: { "@id": url },
        isPartOf: { "@id": WEBSITE_ID() },
        url,
        image: `${siteUrl}${OG_IMAGE.path}`,
        inLanguage: "en",
        author: org,
        publisher: org,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        isPartOf: { "@id": url },
        mainEntity: guide.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guides` },
          { "@type": "ListItem", position: 3, name: guide.question, item: url },
        ],
      },
    ],
  };
}

export function guidesIndexJsonLd(guides: Guide[]) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/guides`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        name: "Domain name decision guides",
        url,
        isPartOf: { "@id": WEBSITE_ID() },
        publisher: { "@id": ORG_ID() },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: guides.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${siteUrl}/guides/${g.slug}`,
            name: g.question,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Guides", item: url },
        ],
      },
    ],
  };
}
