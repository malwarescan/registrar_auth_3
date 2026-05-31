import type { MetadataRoute } from "next";

const DEMO_DOMAINS = [
  "brightnest-com",
  "ecohometech-net",
  "smartecohome-com",
  "ecohome-tech",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intel.namesilo.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  const domainRoutes: MetadataRoute.Sitemap = DEMO_DOMAINS.map((slug) => ({
    url: `${siteUrl}/domain/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...domainRoutes];
}
