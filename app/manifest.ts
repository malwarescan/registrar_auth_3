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
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
