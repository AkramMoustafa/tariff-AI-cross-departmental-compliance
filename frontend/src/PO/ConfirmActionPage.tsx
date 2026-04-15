import { useState } from "react";

const ConfirmActionPage = () => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);

    setTimeout(() => {
      window.location.href = "/po/executed"; // ✅ simple navigation
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">

      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">

        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Confirm Purchase Order Action
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Review the impact before executing this decision.
        </p>

        {/* Static PO Info */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            Purchase Order: <span className="font-medium">#1234</span>
          </p>
        </div>

        {/* Impact Summary */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Action Summary
          </h3>

          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Shipping method → <span className="font-medium">Air Freight</span></li>
            <li>• Additional cost → <span className="font-medium text-red-600">$120,000</span></li>
            <li>• Avoided loss → <span className="font-medium text-green-600">$1,900,000</span></li>
            <li>• New expected delay → <span className="font-medium">~5 days</span></li>
          </ul>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-yellow-800">
            This action will update the purchase order and trigger execution.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">

          <button
            onClick={() => window.history.back()} // ✅ replaces router.back()
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Executing..." : "Confirm & Execute"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ConfirmActionPage;