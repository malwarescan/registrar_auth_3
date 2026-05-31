import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

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
