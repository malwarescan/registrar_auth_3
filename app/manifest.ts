import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#004a99",
    description: SITE_DESCRIPTION,
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
