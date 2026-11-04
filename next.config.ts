import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
  async redirects() {
    return [
      {
        // Guide re-angled from "SEO relevance" to a used-domain history audit (2026-11-05).
        source: "/guides/how-to-check-domain-name-seo-relevance",
        destination: "/guides/how-to-check-a-used-domains-history-before-buying",
        statusCode: 301,
      },
    ];
  },
};

export default withPWA(nextConfig);
