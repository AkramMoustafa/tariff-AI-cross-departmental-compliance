import React from "react";

type Props = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  delay: number;
  exposure: number;
  action: string;
};

const riskStyles = {
  HIGH: { bg: "bg-red-100", text: "text-red-600", label: "HIGH RISK" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-600", label: "MEDIUM RISK" },
  LOW: { bg: "bg-green-100", text: "text-green-600", label: "LOW RISK" },
};

const RiskDecisionCard = ({ riskLevel, delay, exposure, action }: Props) => {
  const style = riskStyles[riskLevel];

  return (
    <div className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 border border-gray-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Purchase Order Risk Decision
        </h2>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      </div>

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

      {/* Recommended Action */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm font-semibold text-blue-700 mb-1">
          Recommended Action
        </p>
        <p className="text-sm text-gray-700">
          {action}
        </p>
      </div>

      {/* Why */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Why this decision?
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          {riskLevel === "HIGH" && <li>• High delay risk detected on selected route</li>}
          {riskLevel === "MEDIUM" && <li>• Moderate delay risk detected — monitor closely</li>}
          {riskLevel === "LOW" && <li>• Low delay risk — shipment looks on track</li>}
          <li>• Shipment value increases financial exposure</li>
          <li>• ML model trained on historical trade route data</li>
        </ul>
      </div>

    </div>
  );
};

export default RiskDecisionCard;