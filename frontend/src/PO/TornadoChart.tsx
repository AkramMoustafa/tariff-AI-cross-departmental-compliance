// TornadoChart.tsx
// Executive-grade tornado chart (clean, strong, mirrored, readable)

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  LabelList,
  ReferenceArea,
} from "recharts";

type TornadoRow = {
  driver: string;
  lowImpact: number;   // negative = favorable cost decrease
  highImpact: number;  // positive = adverse cost increase
};

const BASE_LANDED_COST = 2_500_000;

const formatCurrency = (v: number) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  const fmt =
    abs >= 1_000_000
      ? `${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
      ? `${Math.round(abs / 1_000)}k`
      : `${Math.round(abs)}`;
  return `${sign}$${fmt}`;
};

const formatPercent = (v: number) =>
  `${((v / BASE_LANDED_COST) * 100).toFixed(1)}%`;

const DATA: TornadoRow[] = [
  { driver: "FX rate", lowImpact: -130000, highImpact: 130000 },
  { driver: "Ocean freight", lowImpact: -90000, highImpact: 90000 },
  { driver: "Duty rate", lowImpact: -60000, highImpact: 60000 },
  { driver: "Inland logistics", lowImpact: -35000, highImpact: 35000 },
  { driver: "Demurrage / detention", lowImpact: -25000, highImpact: 25000 },
  { driver: "Insurance", lowImpact: -8000, highImpact: 8000 },
];

// Sort largest swing first
const sorted = [...DATA].sort(
  (a, b) =>
    Math.abs(b.highImpact - b.lowImpact) -
    Math.abs(a.highImpact - a.lowImpact),
);

const maxAbs = Math.max(
  ...sorted.flatMap((d) => [
    Math.abs(d.lowImpact),
    Math.abs(d.highImpact),
  ]),
);

const xDomain: [number, number] = [
  -(maxAbs * 1.25),
  maxAbs * 1.25,
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload as TornadoRow;
  const swing = row.highImpact - row.lowImpact;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        {row.driver}
      </div>

      <div>
        Favorable: <strong>{formatCurrency(row.lowImpact)}</strong>{" "}
        ({formatPercent(row.lowImpact)})
      </div>

      <div>
        Adverse: <strong>{formatCurrency(row.highImpact)}</strong>{" "}
        ({formatPercent(row.highImpact)})
      </div>

      <div style={{ marginTop: 6, opacity: 0.7 }}>
        Total swing: <strong>{formatCurrency(swing)}</strong>
      </div>
    </div>
  );
}

export default function TornadoChart() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1050,
        margin: "0 auto",
        padding: 24,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          Landed Cost Sensitivity
        </div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
          One-way sensitivity vs base case (largest impact at top)
        </div>
      </div>

      <div style={{ height: 460 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 10, right: 50, left: 20, bottom: 30 }}
            barGap={-14}
            barCategoryGap={30}
          >
            {/* Light grid */}
            <CartesianGrid stroke="#f3f4f6" vertical={false} />

            <XAxis
              type="number"
              domain={xDomain}
              tickFormatter={(v) => formatCurrency(v)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />

            <YAxis
              type="category"
              dataKey="driver"
              width={200}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 14, fontWeight: 500 }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Subtle center highlight */}
            <ReferenceArea
              x1={-maxAbs * 0.02}
              x2={maxAbs * 0.02}
              strokeOpacity={0}
              fill="#f9fafb"
            />

            {/* Base case line */}
            <ReferenceLine
              x={0}
              stroke="#374151"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Favorable (cost decrease) */}
            <Bar
              dataKey="lowImpact"
              fill="#10b981"
              radius={[16, 0, 0, 16]}
              barSize={30}
            >
              <LabelList
                dataKey="lowImpact"
                position="insideLeft"
                formatter={(v: number) =>
                  v !== 0 ? formatCurrency(v) : ""
                }
                style={{
                  fill: "white",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
            </Bar>

            {/* Adverse (cost increase) */}
            <Bar
              dataKey="highImpact"
              fill="#ef4444"
              radius={[0, 16, 16, 0]}
              barSize={30}
            >
              <LabelList
                dataKey="highImpact"
                position="insideRight"
                formatter={(v: number) =>
                  v !== 0 ? formatCurrency(v) : ""
                }
                style={{
                  fill: "white",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}