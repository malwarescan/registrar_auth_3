import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides/guides";
import { getSiteUrl } from "@/lib/site";

/** Last real content change to the home, compare, about and methodology pages. Bump when their copy changes. */
const STATIC_PAGES_UPDATED = "2026-11-05";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const latestGuide = GUIDES.map((g) => g.dateModified).sort().at(-1) ?? STATIC_PAGES_UPDATED;

  // /portfolio (per-user saved list) and /ask (not launched) are noindexed and left out.
  // /domain/* reports are on-demand and noindexed, so they are not listed either.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: STATIC_PAGES_UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/compare`, lastModified: STATIC_PAGES_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: STATIC_PAGES_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/methodology`, lastModified: STATIC_PAGES_UPDATED, changeFrequency: "monthly", priority: 0.6 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/guides`, lastModified: latestGuide, changeFrequency: "weekly", priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${siteUrl}/guides/${g.slug}`,
      lastModified: g.dateModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...guideRoutes];
}
