import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/guides/schema";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ask",
  description: "An AI domain advisor that is not available yet.",
  alternates: { canonical: `${getSiteUrl()}/ask` },
  // "Coming soon" stub: keep it out of the index until the advisor ships.
  robots: { index: false, follow: true },
};

export default function AskPage() {
  return (
    <PageShell headerTitle="Ask">
      <Card>
        <p className="text-sm text-[var(--on-surface-variant)]">
          AI domain advisor coming soon. Use Search and Compare to evaluate domains with signal
          intelligence today.
        </p>
      </Card>
    </PageShell>
  );
}
