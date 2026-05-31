import { Award, Search, ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { CompareResponse } from "@/lib/types/domain";

const ICONS = {
  brand: Award,
  search: Search,
  balance: ArrowLeftRight,
};

type DecisionSummaryProps = {
  decisions: CompareResponse["decisions"];
};

export function DecisionSummary({ decisions }: DecisionSummaryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--on-surface)]">Decision Summary</h2>
      {decisions.map((d) => {
        const Icon = ICONS[d.icon];
        return (
          <Card key={d.id} padding="sm" className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-container-low)]">
              <Icon className="h-5 w-5 text-[var(--secondary)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--on-surface)]">{d.title}</p>
              <p className="text-sm text-[var(--on-surface-variant)]">{d.description}</p>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
