"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/Card";

type TradeoffMapProps = {
  points: Array<{ domain: string; brandStrength: number; searchRelevance: number }>;
  summary: string;
};

export function TradeoffMap({ points, summary }: TradeoffMapProps) {
  const data = points.map((p) => ({
    x: p.brandStrength,
    y: p.searchRelevance,
    name: p.domain,
  }));

  return (
    <Card className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--on-surface)]">
        Tradeoff Map: Brand vs. SEO
      </h2>
      <div className="h-56 w-full md:h-64 lg:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Brand Strength"
              domain={[40, 100]}
              tick={{ fontSize: 10 }}
              label={{ value: "Brand Strength", position: "bottom", fontSize: 11, offset: 0 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Search Relevance"
              domain={[40, 100]}
              tick={{ fontSize: 10 }}
              label={{ value: "Search Relevance", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <ReferenceLine x={70} stroke="var(--outline-variant)" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="var(--outline-variant)" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value) => [value ?? 0, "Score"]}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { name?: string })?.name ?? ""
              }
            />
            <Scatter data={data} fill="var(--secondary)" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-[var(--on-surface-variant)]">{summary}</p>
    </Card>
  );
}
