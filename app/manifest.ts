import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NameSilo Intelligence",
    short_name: "NS Intel",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#004a99",
    description:
      "Professional NameSilo Marketplace with integrated domain signal intelligence for brand, SEO, and AI visibility.",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "1024x1024",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "1024x1024",
        type: "image/x-icon",
        purpose: "maskable",
      },
    ],
  };
}
