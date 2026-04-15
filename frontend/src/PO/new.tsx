import React, { useState } from "react";

const poData = {
  id: "PO-20481",
  product: "Industrial fasteners",
  quantity: 18000,
  delivery: "May 18, 2026",

  supplierA: {
    tariff: 18400,
    delayProb: 0.68,
    delayDays: 9,
    exposure: 42750,

    delayBreakdown: [
      { label: "Port congestion", value: 3.2 },
      { label: "Supplier reliability", value: 2.5 },
      { label: "Weather risk", value: 1.8 },
      { label: "Geopolitical risk", value: 1.5 },
    ],

    delayCost: 12300,
  },

  supplierB: {
    tariff: 7200,
    delayProb: 0.29,
    delayDays: 3,
    exposure: 14300,

    delayBreakdown: [
      { label: "Port congestion", value: 1.5 },
      { label: "Supplier reliability", value: 0.8 },
      { label: "Weather risk", value: 0.5 },
      { label: "Geopolitical risk", value: 0.2 },
    ],

    delayCost: 4200,
  },

  savings: 28450,
  confidence: 0.91,
};

export default function PurchaseOrderRiskPage() {
  const [decision, setDecision] = useState<"blocked" | "approved">("blocked");
  const [overrideReason, setOverrideReason] = useState("");

  const delayDifference =
    poData.supplierA.delayDays - poData.supplierB.delayDays;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm uppercase tracking-widest text-zinc-500">
              Pre-Approval Control
            </p>
            <h1 className="text-4xl font-semibold mt-2">
              Prevent financial loss before approval
            </h1>
            <p className="mt-3 text-zinc-600 max-w-2xl">
              This decision is based on tariff data, supplier risk signals, and
              historical shipment performance.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-zinc-500">PO</p>
            <p className="font-semibold">{poData.id}</p>
            <p className="text-sm mt-1">{poData.product}</p>
            <p className="text-sm text-zinc-600">{poData.delivery}</p>
          </div>
        </div>

        {/* 🔥 DECISION BLOCK */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-sm uppercase text-red-700 font-semibold">
            System Decision
          </p>

          <h2 className="text-2xl font-semibold mt-2">
            Selecting Supplier A adds ${poData.savings.toLocaleString()} in avoidable cost and {delayDifference} additional delay days
          </h2>

          <p className="mt-3 text-zinc-700">
            This purchase order is blocked unless a lower-risk supplier is selected.
          </p>

          <div className="mt-4 flex gap-4 text-sm text-zinc-600 flex-wrap">
            <span>Confidence: {(poData.confidence * 100).toFixed(0)}%</span>
            <span>Tariff Source: HTS + Trade Data</span>
            <span>Delay Model: 12-month shipment history</span>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setDecision("blocked")}
            >
              Block Order
            </button>

            <button
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setDecision("approved")}
            >
              Switch to Supplier B
            </button>

            <button className="border px-4 py-2 rounded-lg">
              Escalate to Sourcing
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Exposure" value={`$${poData.supplierA.exposure.toLocaleString()}`} />
          <Card title="Tariff" value={`$${poData.supplierA.tariff.toLocaleString()}`} />
          <Card
            title="Delay Impact"
            value={`${poData.supplierA.delayDays} days`}
            subtitle={`$${poData.supplierA.delayCost.toLocaleString()} impact`}
          />
          <Card
            title="Savings"
            value={`$${poData.savings.toLocaleString()}`}
            highlight
          />
        </div>

        {/* SUPPLIER COMPARISON */}
        <div className="grid md:grid-cols-2 gap-6">
          <SupplierCard title="Supplier A" data={poData.supplierA} bad />
          <SupplierCard title="Supplier B" data={poData.supplierB} good />
        </div>

        {/* 🔥 OVERRIDE */}
        {decision === "approved" && (
          <div className="bg-white border rounded-xl p-6">
            <p className="font-semibold">Override Justification Required</p>

            <textarea
              className="w-full border mt-3 p-3 rounded-lg"
              placeholder="Explain why you are overriding the system recommendation..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
            />

            <button className="mt-3 bg-black text-white px-4 py-2 rounded-lg">
              Confirm Approval (Logged)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* 🔧 COMPONENTS */

const Card = ({ title, value, subtitle, highlight = false }: any) => (
  <div className={`p-5 rounded-xl border ${highlight ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}>
    <p className="text-sm text-zinc-500">{title}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>

    {subtitle && (
      <p className="text-sm text-zinc-600 mt-2">{subtitle}</p>
    )}
  </div>
);

const SupplierCard = ({ title, data, bad, good }: any) => (
  <div className={`p-5 rounded-xl border ${bad ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
    <p className="text-sm text-zinc-500">{title}</p>
    <p className="text-lg font-semibold mt-1">
      {bad ? "Reject" : "Approve candidate"}
    </p>

    <div className="mt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Tariff</span>
        <span>${data.tariff.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Delay probability</span>
        <span>{(data.delayProb * 100).toFixed(0)}%</span>
      </div>
      <div className="flex justify-between">
        <span>Expected delay</span>
        <span>{data.delayDays} days</span>
      </div>
      <div className="flex justify-between">
        <span>Exposure</span>
        <span>${data.exposure.toLocaleString()}</span>
      </div>
    </div>

    {/* 🔥 DELAY BREAKDOWN */}
    <div className="mt-5">
      <p className="text-xs uppercase text-zinc-500 mb-2">
        Delay Drivers
      </p>

      <div className="space-y-2">
        {data.delayBreakdown.map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-zinc-600">{item.label}</span>
            <span className="font-medium">+{item.value}d</span>
          </div>
        ))}
      </div>
    </div>

    {/* 🔥 DELAY COST */}
    <div className="mt-4 text-sm text-zinc-700">
      Delay Impact:{" "}
      <span className="font-semibold">
        ${data.delayCost.toLocaleString()}
      </span>
    </div>
  </div>
);