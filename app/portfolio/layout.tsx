import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/guides/schema";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Your saved domains for comparison and purchase decisions.",
  alternates: { canonical: `${getSiteUrl()}/portfolio` },
  // A per-visitor saved list stored in the browser: no stand-alone search value.
  robots: { index: false, follow: true },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
