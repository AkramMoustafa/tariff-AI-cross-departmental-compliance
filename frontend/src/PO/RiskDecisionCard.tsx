import React from "react";

type Props = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  delay: number;
  exposure: number;
  action: string;
  onReviewClick?: () => void;
};

const riskStyles = {
  HIGH:   { bg: "bg-red-100",    text: "text-red-600",    label: "HIGH RISK" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-600", label: "MEDIUM RISK" },
  LOW:    { bg: "bg-green-100",  text: "text-green-600",  label: "LOW RISK" },
};

const RiskDecisionCard = ({ riskLevel, delay, exposure, action, onReviewClick }: Props) => {
  const style = riskStyles[riskLevel];

  return (
    <div className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 border border-gray-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-semibold text-gray-800">
          AI Risk Recommendation
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
            Pending Review
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-5">
        AI-generated — requires human approval before execution
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Predicted Delay</p>
          <p className="text-lg font-semibold">{delay} Days</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Financial Exposure</p>
          <p className="text-lg font-semibold">${exposure.toLocaleString()}</p>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm font-semibold text-blue-700 mb-1">
          AI Recommendation
        </p>
        <p className="text-sm text-gray-700">{action}</p>
      </div>

      {/* Why */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Why this recommendation?
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          {riskLevel === "HIGH"   && <li>• High delay risk detected on selected route</li>}
          {riskLevel === "MEDIUM" && <li>• Moderate delay risk detected — monitor closely</li>}
          {riskLevel === "LOW"    && <li>• Low delay risk — shipment looks on track</li>}
          <li>• Shipment value increases financial exposure</li>
          <li>• ML model trained on historical trade route data</li>
        </ul>
      </div>

      {/* Open Decision Review */}
      <button
        onClick={onReviewClick}
        className="mt-5 w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
      >
        Open Decision Review →
      </button>

    </div>
  );
};

export default RiskDecisionCard;
