import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: true },
};

export default function OfflinePage() {
  return (
    <PageShell hideNav>
      <Card>
        <h1 className="mb-2 text-lg font-semibold">You&apos;re offline</h1>
        <p className="mb-4 text-sm text-[var(--on-surface-variant)]">
          NameSilo Intelligence requires a connection for domain analysis.
        </p>
        <Link href="/">
          <Button size="sm">Retry</Button>
        </Link>
      </Card>
    </PageShell>
  );
}
