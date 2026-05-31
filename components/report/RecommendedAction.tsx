import { Card } from "@/components/ui/Card";

type RecommendedActionProps = {
  text: string;
};

export function RecommendedAction({ text }: RecommendedActionProps) {
  return (
    <Card>
      <h2 className="mb-2 text-base font-semibold text-[var(--on-surface)]">Recommended Action</h2>
      <p className="text-sm text-[var(--on-surface-variant)]">{text}</p>
    </Card>
  );
}
