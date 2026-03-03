// MarginRiskDashboard.tsx
// Procurement Risk & Margin Exposure View (Static Design)

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

// -----------------------------
// Static Data
// -----------------------------

const COST_BREAKDOWN = [
  { name: "Product", value: 1800000, category: "Fixed" },
  { name: "Freight", value: 250000, category: "Market-linked" },
  { name: "Insurance", value: 40000, category: "Market-linked" },
  { name: "Duties", value: 220000, category: "Policy-linked" },
  { name: "Port / Handling", value: 80000, category: "Operational-risk-driven" },
  { name: "Inland Transport", value: 120000, category: "Operational-risk-driven" },
  { name: "FX Impact", value: 150000, category: "Market-linked" },
  { name: "Financing", value: 60000, category: "Market-linked" },
];

const MARGIN_STATS = {
  expected: 18,
  p10: 12,
  probBelow10: 8,
};

const formatCurrency = (v: number) =>
  `$${(v / 1_000_000).toFixed(2)}M`;

// -----------------------------
// Component
// -----------------------------

export default function MarginRiskDashboard() {
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
      {/* Header                          */}
      {/* -------------------------------- */}

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>
          Procurement Risk & Margin Exposure
        </div>
        <div style={{ marginTop: 6, opacity: 0.7 }}>
          Landed Cost = Product + Freight + Insurance + Duties + Port/Handling + Inland Transport + FX + Financing
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Margin Risk Verdict             */}
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
            fontSize: 28,
            fontWeight: 800,
            color: "#b91c1c",
          }}
        >
          8% probability margin falls below 10%
        </div>

        <div style={{ marginTop: 12, fontSize: 16 }}>
          Expected margin: <strong>{MARGIN_STATS.expected}%</strong>
        </div>
        <div style={{ fontSize: 16 }}>
          10th percentile margin: <strong>{MARGIN_STATS.p10}%</strong>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Cost Breakdown Chart            */}
      {/* -------------------------------- */}

      <div style={{ marginBottom: 50 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
          Landed Cost Decomposition
        </div>

        <div style={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={COST_BREAKDOWN}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
              <CartesianGrid stroke="#f3f4f6" vertical={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
              />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[0, 10, 10, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Risk Category Summary           */}
      {/* -------------------------------- */}

      <div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
          Risk Category Classification
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 18,
          }}
        >
          {["Fixed", "Market-linked", "Policy-linked", "Operational-risk-driven"].map(
            (cat) => (
              <div
                key={cat}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  {cat}
                </div>
                <div style={{ fontSize: 14, opacity: 0.75 }}>
                  {COST_BREAKDOWN.filter((c) => c.category === cat)
                    .map((c) => c.name)
                    .join(", ")}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}