/**
 * Single source of truth for the site's brand and entity.
 * Every title suffix, the manifest, the header fallback, og:site_name, the OG
 * image and the Organization/WebSite JSON-LD read from here.
 */
export const SITE_NAME = "NameMog";
export const SITE_SHORT_NAME = "NameMog";

/** Operator disclosure (owner-confirmed 2026-11-05). */
export const OPERATOR = {
  name: "NameSilo",
  url: "https://www.namesilo.com",
  id: "https://www.namesilo.com/#organization",
  sameAs: ["https://en.wikipedia.org/wiki/NameSilo"],
};
export const OPERATOR_DISCLOSURE = `${SITE_NAME} is run by ${OPERATOR.name}.`;

/** What the site does, in one sentence. */
export const SITE_DESCRIPTION =
  "Score and compare domain names for brand strength, SEO fit and AI/entity clarity, then check availability and price before you buy.";

export const SITE_TAGLINE = "Score and compare domain names for brand, SEO and AI clarity";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://namemog.com").replace(/\/$/, "");
}

export const ORG_ID = () => `${getSiteUrl()}/#organization`;
export const WEBSITE_ID = () => `${getSiteUrl()}/#website`;

export const LOGO = { path: "/logo.png", width: 1381, height: 349 };
export const OG_IMAGE = { path: "/og-image.png", width: 1200, height: 630 };

/**
 * Open Graph fields every page must carry. Next.js merges metadata shallowly,
 * so any page that sets `openGraph` must spread this in or it loses
 * og:site_name and og:image.
 */
export function ogBase() {
  return {
    siteName: SITE_NAME,
    locale: "en_US",
    images: [{ url: OG_IMAGE.path, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: SITE_TAGLINE }],
  };
}

/** Sitewide Organization + WebSite entity graph, emitted from the root layout. */
export function siteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID(),
        name: SITE_NAME,
        url: `${siteUrl}/`,
        logo: {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#logo`,
          url: `${siteUrl}${LOGO.path}`,
          width: LOGO.width,
          height: LOGO.height,
        },
        image: { "@id": `${siteUrl}/#logo` },
        description: `${SITE_NAME} scores and compares domain names for brand strength, SEO fit and AI/entity clarity. It is run by ${OPERATOR.name}.`,
        parentOrganization: {
          "@type": "Organization",
          "@id": OPERATOR.id,
          name: OPERATOR.name,
          url: OPERATOR.url,
          sameAs: OPERATOR.sameAs,
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID(),
        name: SITE_NAME,
        url: `${siteUrl}/`,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": ORG_ID() },
      },
    ],
  };
}

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
