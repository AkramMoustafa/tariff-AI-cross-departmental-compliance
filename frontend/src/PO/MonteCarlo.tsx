// MonteCarloDashboard.tsx
// Human-optimized static Monte Carlo dashboard

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// -----------------------------
// Mock Simulation Output
// -----------------------------

const MOCK_RESULTS = [
  2450000, 2480000, 2500000, 2520000, 2550000, 2580000,
  2600000, 2620000, 2650000, 2680000, 2700000, 2720000,
  2750000, 2780000, 2800000, 2850000,
];

const BUDGET = 2650000;

// -----------------------------
// Utilities
// -----------------------------

const formatCurrency = (v: number) =>
  `$${(v / 1_000_000).toFixed(2)}M`;

const buildHistogram = (data: number[], bins = 6) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const width = (max - min) / bins;

  const buckets = Array.from({ length: bins }, (_, i) => ({
    binStart: min + i * width,
    binEnd: min + (i + 1) * width,
    count: 0,
  }));

  data.forEach((v) => {
    const idx = Math.min(
      Math.floor((v - min) / width),
      bins - 1
    );
    buckets[idx].count += 1;
  });

  return buckets.map((b) => ({
    mid: (b.binStart + b.binEnd) / 2,
    count: b.count,
  }));
};

const buildCDF = (data: number[]) => {
  const sorted = [...data].sort((a, b) => a - b);
  return sorted.map((value, index) => ({
    value,
    probability: (index + 1) / sorted.length,
  }));
};

const HISTOGRAM_DATA = buildHistogram(MOCK_RESULTS);
const CDF_DATA = buildCDF(MOCK_RESULTS);

// Executive-focused metrics (cleaned)
const STATS = {
  mean: 2_640_000,
  p50: 2_620_000,
  p90: 2_780_000,
  probabilityExceed: 37,
};

// -----------------------------
// Component
// -----------------------------

export default function MonteCarloDashboard() {
  return (
    <div
      style={{
        maxWidth: 1150,
        margin: "0 auto",
        padding: 32,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
      }}
    >
      {/* -------------------------------- */}
      {/* Verdict Section (Top Priority)  */}
      {/* -------------------------------- */}

      <div
        style={{
          marginBottom: 40,
          padding: 28,
          borderRadius: 16,
          background: "#fff7f7",
          border: "1px solid #fecaca",
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#b91c1c",
          }}
        >
          {STATS.probabilityExceed}% probability of exceeding budget
        </div>

        <div style={{ marginTop: 8, fontSize: 16 }}>
          P90 landed cost:{" "}
          <strong>{formatCurrency(STATS.p90)}</strong>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Key Metrics (Simplified)        */}
      {/* -------------------------------- */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 48,
        }}
      >
        {[
          ["Expected Cost", STATS.mean],
          ["Median (P50)", STATS.p50],
          ["Downside (P90)", STATS.p90],
        ].map(([label, value]) => (
          <div
            key={label as string}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.6 }}>
              {label}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginTop: 6,
              }}
            >
              {formatCurrency(value as number)}
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------- */}
      {/* Distribution Histogram           */}
      {/* -------------------------------- */}

      <div style={{ marginBottom: 50 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 14,
          }}
        >
          Distribution of Possible Total Costs
        </div>

        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HISTOGRAM_DATA}>
              <CartesianGrid stroke="#f3f4f6" />
              <XAxis
                dataKey="mid"
                tickFormatter={(v) => formatCurrency(v)}
              />
              <YAxis />
              <Tooltip
                formatter={(v: number) => v}
              />

              {/* Risk Zone Shading */}
              <ReferenceArea
                x1={BUDGET}
                x2={Math.max(...MOCK_RESULTS)}
                fill="#fee2e2"
              />

              {/* Budget Line */}
              <ReferenceLine
                x={BUDGET}
                stroke="#dc2626"
                strokeWidth={2}
                label={{
                  value: "Budget Threshold",
                  position: "top",
                  fill: "#dc2626",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Probability Curve (Renamed)     */}
      {/* -------------------------------- */}

      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 14,
          }}
        >
          Probability of Exceeding Cost Levels
        </div>

        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CDF_DATA}>
              <CartesianGrid stroke="#f3f4f6" />
              <XAxis
                dataKey="value"
                tickFormatter={(v) => formatCurrency(v)}
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(v) =>
                  `${(v * 100).toFixed(0)}%`
                }
              />
              <Tooltip
                formatter={(v: number) =>
                  `${(v * 100).toFixed(1)}%`
                }
              />

              <ReferenceLine
                x={BUDGET}
                stroke="#dc2626"
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="probability"
                stroke="#111827"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}