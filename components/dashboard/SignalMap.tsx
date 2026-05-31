"use client";

import {
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { GraphPoint } from "@/lib/types/domain";

type SignalMapProps = {
  title: string;
  subtitle?: string;
  points: GraphPoint[];
  xLabel: string;
  yLabel: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  quadrantLabels?: {
    topRight?: string;
    topLeft?: string;
    bottomRight?: string;
    bottomLeft?: string;
  };
  activeDomain?: string | null;
  onSelectDomain?: (domain: string) => void;
  compact?: boolean;
};

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#7c3aed", "#ec4899", "#0891b2", "#64748b"];

export function SignalMap({
  title,
  subtitle,
  points,
  xLabel,
  yLabel,
  xDomain = [40, 100],
  yDomain = [40, 100],
  quadrantLabels,
  activeDomain,
  onSelectDomain,
  compact,
}: SignalMapProps) {
  const midX = (xDomain[0] + xDomain[1]) / 2;
  const midY = (yDomain[0] + yDomain[1]) / 2;

  const data = points.map((p, i) => ({
    ...p,
    fill: COLORS[i % COLORS.length],
    active: p.domain === activeDomain,
  }));

  return (
    <Card className="space-y-2" padding={compact ? "sm" : "md"}>
      <div>
        <h3 className="text-sm font-semibold text-[var(--on-surface)]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[var(--on-surface-variant)]">{subtitle}</p>
        )}
      </div>
      <div className={compact ? "h-48 w-full" : "h-64 w-full md:h-72"}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 24, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
            <XAxis
              type="number"
              dataKey="x"
              domain={xDomain}
              tick={{ fontSize: 10 }}
              name={xLabel}
            >
              <Label value={xLabel} offset={-8} position="insideBottom" fontSize={11} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={yDomain}
              tick={{ fontSize: 10 }}
              width={32}
              name={yLabel}
            >
              <Label value={yLabel} angle={-90} position="insideLeft" fontSize={11} style={{ textAnchor: "middle" }} />
            </YAxis>
            <ReferenceLine x={midX} stroke="var(--outline-variant)" strokeDasharray="4 4" />
            <ReferenceLine y={midY} stroke="var(--outline-variant)" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const p = payload[0].payload as GraphPoint;
                return (
                  <div className="rounded border border-[var(--outline-variant)] bg-white px-2 py-1.5 text-xs shadow-sm">
                    <p className="font-semibold">{p.domain}</p>
                    <p>{xLabel}: {p.x}</p>
                    <p>{yLabel}: {p.y}</p>
                    <p>${p.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                );
              }}
            />
            <Scatter
              data={data}
              onClick={(d) => {
                const point = d as unknown as GraphPoint;
                if (point?.domain) onSelectDomain?.(point.domain);
              }}
              style={{ cursor: onSelectDomain ? "pointer" : "default" }}
            >
              {data.map((entry, index) => (
                <Cell key={entry.domain} fill={entry.fill} r={entry.active ? 8 : 6} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {quadrantLabels && !compact && (
        <div className="grid grid-cols-2 gap-1 text-[10px] text-[var(--on-surface-variant)]">
          <span>{quadrantLabels.topLeft}</span>
          <span className="text-right">{quadrantLabels.topRight}</span>
          <span>{quadrantLabels.bottomLeft}</span>
          <span className="text-right">{quadrantLabels.bottomRight}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {points.map((p, i) => (
          <button
            key={p.domain}
            type="button"
            onClick={() => onSelectDomain?.(p.domain)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--outline-variant)] px-2 py-0.5 text-[10px] font-medium transition-colors hover:border-[var(--secondary)]"
            style={{
              borderColor: p.domain === activeDomain ? COLORS[i % COLORS.length] : undefined,
              background: p.domain === activeDomain ? "var(--surface-container-low)" : undefined,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {p.domain.split(".")[0]}
          </button>
        ))}
      </div>
    </Card>
  );
}
