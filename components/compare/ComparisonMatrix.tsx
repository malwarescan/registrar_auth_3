import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type ComparisonMatrixProps = {
  domains: string[];
  rankings: Record<string, { brand: number; seo: number; ai: number }>;
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
        rank === 1 && "bg-[var(--secondary)] text-white",
        rank === 2 && "bg-[var(--surface-container)] text-[var(--on-surface-variant)]",
        rank === 3 && "bg-[var(--warning-container)] text-[#92400e]"
      )}
    >
      {rank}
    </span>
  );
}

export function ComparisonMatrix({ domains, rankings }: ComparisonMatrixProps) {
  return (
    <Card className="overflow-x-auto">
      <h2 className="mb-4 text-base font-semibold text-[var(--on-surface)]">Comparison Matrix</h2>
      <table className="w-full min-w-[280px] text-sm">
        <thead>
          <tr className="border-b border-[var(--outline-variant)] text-left text-[var(--on-surface-variant)]">
            <th className="pb-2 pr-4 font-medium">Domain</th>
            <th className="pb-2 px-2 text-center font-medium">Brand</th>
            <th className="pb-2 px-2 text-center font-medium">SEO</th>
            <th className="pb-2 pl-2 text-center font-medium">AI</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => {
            const r = rankings[domain];
            if (!r) return null;
            return (
              <tr key={domain} className="border-b border-[var(--outline-variant)] last:border-0">
                <td className="py-3 pr-4 font-medium text-[var(--on-surface)]">{domain}</td>
                <td className="py-3 px-2 text-center"><RankBadge rank={r.brand} /></td>
                <td className="py-3 px-2 text-center"><RankBadge rank={r.seo} /></td>
                <td className="py-3 pl-2 text-center"><RankBadge rank={r.ai} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
