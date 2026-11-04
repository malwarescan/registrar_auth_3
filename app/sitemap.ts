import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://namemog.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${siteUrl}/guides/${g.slug}`,
      lastModified: new Date(g.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  // /domain/* reports are on-demand and noindexed, so they are not listed here.
  return [...staticRoutes, ...guideRoutes];
}
