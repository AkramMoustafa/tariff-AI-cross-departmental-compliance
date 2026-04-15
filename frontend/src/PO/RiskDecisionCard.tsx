import React from "react";

const RiskDecisionCard = () => {
  return (
    <div className="w-full mx-auto bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Purchase Order Risk Decision
        </h2>
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-600">
          HIGH RISK
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Predicted Delay</p>
          <p className="text-lg font-semibold">43 Days</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Financial Exposure</p>
          <p className="text-lg font-semibold">$2.1M</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Confidence</p>
          <p className="text-lg font-semibold">82%</p>
        </div>
      </div>

      {/* Decision Options */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Decision Options</h3>

        {/* Option 1 */}
        <div className="p-4 rounded-lg border border-gray-200 mb-3">
          <p className="font-medium">Option 1: Do Nothing</p>
          <p className="text-sm text-gray-600">Expected Loss: $2.1M</p>

          <button className="mt-3 px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300">
            Accept Risk
          </button>
        </div>

        {/* Option 2 */}
        <div className="p-4 rounded-lg border border-green-300 bg-green-50">
          <p className="font-medium">Option 2: Expedite Air Freight</p>
          <p className="text-sm text-gray-600">Cost: $120k</p>
          <p className="text-sm text-gray-600 mb-2">Avoided Loss: $1.9M</p>

          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = "/confirm")}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve & Expedite
            </button>

            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
              Simulate Other Options
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm font-semibold text-blue-700 mb-1">
          Recommended Action
        </p>
        <p className="text-sm text-gray-700 mb-3">
          Switch to expedited air freight to avoid a ~43-day delay and prevent significant financial loss.
        </p>

        <button
          onClick={() => (window.location.href = "/confirm")}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Execute Recommendation
        </button>
      </div>
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Why this decision?
        </p>

        <ul className="text-sm text-gray-600 space-y-1">
          <li>• High delay risk detected on selected route</li>
          <li>• Shipment value increases financial exposure</li>
          <li>• Air freight cost is significantly lower than expected loss</li>
        </ul>
      </div>

    </div>
  );
};

export default RiskDecisionCard;