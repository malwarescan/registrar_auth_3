"use client";

import {
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { SAMPLE_DECISION_STACK, SAMPLE_GRAPH_POINTS } from "@/lib/search/search-config";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#7c3aed"];

export function ExampleSignalMap() {
  const data = SAMPLE_GRAPH_POINTS.map((p, i) => ({
    ...p,
    name: p.domain.split(".")[0],
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card padding="md" className="lg:col-span-3">
        <h3 className="text-sm font-semibold text-[var(--on-surface)]">Example Signal Map</h3>
        <p className="text-xs text-[var(--on-surface-variant)]">Brand Strength vs SEO Relevance</p>
        <div className="mt-3 h-52 w-full sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[65, 95]}
                tick={{ fontSize: 10 }}
                label={{ value: "Brand Strength", position: "insideBottom", offset: -4, fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[60, 100]}
                tick={{ fontSize: 10 }}
                width={28}
                label={{ value: "SEO", angle: -90, position: "insideLeft", fontSize: 10 }}
              />
              <ReferenceLine x={80} stroke="var(--outline-variant)" strokeDasharray="4 4" />
              <ReferenceLine y={80} stroke="var(--outline-variant)" strokeDasharray="4 4" />
              <Scatter data={data}>
                {data.map((entry, i) => (
                  <Cell key={entry.domain} fill={entry.fill} r={7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {data.map((p) => (
            <span key={p.domain} className="inline-flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)]">
              <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
              {p.name}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--on-surface-variant)]">
          After searching, domains are plotted so you can see which names win for brand, SEO, AI
          visibility, trust, and value.
        </p>
      </Card>

      <Card padding="md" className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-[var(--on-surface)]">Domain Decision Stack</h3>
        <p className="text-xs text-[var(--on-surface-variant)]">Category winners from your brief</p>
        <ul className="mt-4 space-y-3">
          {SAMPLE_DECISION_STACK.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-2 last:border-0 last:pb-0"
            >
              <span className="text-xs font-medium text-[var(--on-surface-variant)]">{row.label}</span>
              <span className="truncate text-sm font-semibold text-[var(--on-surface)]">{row.domain}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
