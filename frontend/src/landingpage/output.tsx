import React from "react";

const data = [
  {
    id: "PO-1827",
    route: "China → Germany",
    risk: "HIGH",
    delay: 15,
    exposure: 1238135,
    status: "BLOCKED",
  },
  {
    id: "PO-1828",
    route: "USA → Canada",
    risk: "LOW",
    delay: 2,
    exposure: 12000,
    status: "APPROVED",
  },
  {
    id: "PO-1829",
    route: "India → UK",
    risk: "MEDIUM",
    delay: 7,
    exposure: 245000,
    status: "REVIEW",
  },
];

const getRiskColor = (risk: string) => {
  if (risk === "HIGH") return "bg-red-100 text-red-700";
  if (risk === "MEDIUM") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const getStatusColor = (status: string) => {
  if (status === "BLOCKED") return "text-red-600";
  if (status === "REVIEW") return "text-yellow-600";
  return "text-green-600";
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Procurement Risk Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor and evaluate purchase orders in real-time
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-semibold">{data.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">High Risk Orders</p>
            <h2 className="text-2xl font-semibold text-red-600">
              {data.filter((d) => d.risk === "HIGH").length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Total Exposure</p>
            <h2 className="text-2xl font-semibold">
              ${data.reduce((acc, d) => acc + d.exposure, 0).toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4 text-left">PO ID</th>
                <th className="px-6 py-4 text-left">Route</th>
                <th className="px-6 py-4 text-left">Risk</th>
                <th className="px-6 py-4 text-left">Delay</th>
                <th className="px-6 py-4 text-left">Exposure</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map((po) => (
                <tr
                  key={po.id}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {po.id}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {po.route}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                        po.risk
                      )}`}
                    >
                      {po.risk}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {po.delay} days
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    ${po.exposure.toLocaleString()}
                  </td>

                  <td
                    className={`px-6 py-4 font-semibold ${getStatusColor(
                      po.status
                    )}`}
                  >
                    {po.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
