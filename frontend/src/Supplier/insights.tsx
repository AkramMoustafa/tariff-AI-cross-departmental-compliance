import { useEffect, useState } from "react";
import { getSuppliers, getHighRiskSuppliers,getWorseningSuppliers } from "@/api/SupplierIntelligence";

export default function S1() {
    const [totalSuppliers, setTotalSuppliers] = useState(0);
    const [highRiskCount, setHighRiskCount] = useState(0);
    const [worseningCount, setWorseningCount] = useState(0);
useEffect(() => {
  const fetchData = async () => {
    try {
      const suppliers = await getSuppliers();
      setTotalSuppliers(suppliers.length);

      const highRisk = await getHighRiskSuppliers();
      setHighRiskCount(highRisk.count);

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  fetchData();
}, []);
const [highRiskSuppliers, setHighRiskSuppliers] = useState<any[]>([]);
useEffect(() => {
  const fetchData = async () => {
    try {
      const suppliers = await getSuppliers();
      setTotalSuppliers(suppliers.length);

      const highRisk = await getHighRiskSuppliers();
      console.log("HIGH RISK RESPONSE:", highRisk);
      setHighRiskCount(highRisk.count);
        const worsening = await getWorseningSuppliers();
        setWorseningCount(worsening.count);
      // 👇 THIS is what you're missing
      setHighRiskSuppliers(highRisk.suppliers);

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  fetchData();
}, []);

  const summaryCards = [
    {
    title: "Suppliers Monitored",
    value: totalSuppliers.toString(),
    subtitle: "Across direct and indirect categories",
    },
    {
    title: "High / Critical Risk",
    value: highRiskCount.toString(),
    subtitle: "Suppliers with HIGH risk level",
    },
    {
      title: "New External Alerts",
      value: "14",
      subtitle: "News, port, forex, ownership, hiring",
    },
    {
      title: "Worsening This Week",
      value: worseningCount.toString(),
      subtitle: "Suppliers with rising risk trend",
    },
  ];

  const suppliers = [
    {
      name: "Apex Components Ltd.",
      region: "Shenzhen, CN",
      category: "Electronics",
      riskScore: 86,
      level: "Critical",
      trend: "Rising",
      drivers: [
        "Port congestion exposure",
        "Negative news sentiment",
        "Supplier registration change",
      ],
      alerts: 4,
      action: "Escalate and contact supplier",
    },
    {
      name: "North Harbor Metals",
      region: "Busan, KR",
      category: "Raw Materials",
      riskScore: 74,
      level: "High",
      trend: "Rising",
      drivers: [
        "FX volatility",
        "Commodity price spike",
        "Hiring slowdown",
      ],
      alerts: 3,
      action: "Monitor daily",
    },
    {
      name: "Valence Industrial Supply",
      region: "Monterrey, MX",
      category: "Packaging",
      riskScore: 58,
      level: "Medium",
      trend: "Stable",
      drivers: [
        "Transport lane delays",
        "Moderate margin pressure",
        "News volume increased",
      ],
      alerts: 2,
      action: "Review weekly",
    },
    {
      name: "BluePeak Precision",
      region: "Brno, CZ",
      category: "Machined Parts",
      riskScore: 29,
      level: "Low",
      trend: "Improving",
      drivers: [
        "Stable operations",
        "No critical macro event",
        "Positive reliability trend",
      ],
      alerts: 1,
      action: "Monitor monthly",
    },
  ];

//   const eventFeed = [
//     {
//       type: "Ownership / Registration",
//       supplier: "Apex Components Ltd.",
//       detail: "Recent registration filing indicates corporate structure change.",
//       severity: "High",
//       time: "2h ago",
//     },
//     {
//       type: "Port Risk",
//       supplier: "Apex Components Ltd.",
//       detail: "Major port congestion increasing transit uncertainty.",
//       severity: "Critical",
//       time: "5h ago",
//     },
//     {
//       type: "Pricing / Commodity",
//       supplier: "North Harbor Metals",
//       detail: "Input material price index rose sharply over the last 7 days.",
//       severity: "High",
//       time: "8h ago",
//     },
//     {
//       type: "Hiring Signal",
//       supplier: "North Harbor Metals",
//       detail: "Sharp slowdown in hiring activity may indicate operational caution.",
//       severity: "Medium",
//       time: "1d ago",
//     },
//     {
//       type: "News Sentiment",
//       supplier: "Valence Industrial Supply",
//       detail: "Increase in regional logistics disruption coverage detected.",
//       severity: "Medium",
//       time: "1d ago",
//     },
//   ];

  const riskDrivers = [
    { label: "Port / Logistics", value: 78 },
    { label: "Negative News", value: 64 },
    { label: "FX Volatility", value: 59 },
    { label: "Ownership Changes", value: 52 },
    { label: "Commodity Pricing", value: 47 },
    { label: "Hiring / Workforce Signals", value: 41 },
  ];

  const levelClasses: Record<string, string> = {
    Critical: "bg-red-100 text-red-700 border-red-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-green-100 text-green-700 border-green-200",
  };

  const trendClasses: Record<string, string> = {
    Rising: "text-red-600",
    Stable: "text-slate-600",
    Improving: "text-green-600",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Supplier Disruption Early Warning
            </p>
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Supplier Risk Intelligence Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 lg:text-base">
              A forward-looking view of supplier instability using internal performance
              signals and macro events such as forex, commodity pricing, news,
              logistics disruptions, workforce changes, and registration updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
              Export Report
            </button>
            <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm">
              Review Critical Suppliers
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-2 text-sm text-slate-600">{card.subtitle}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Priority Supplier Watchlist</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Focus the user on who matters most, why risk is increasing, and what
                  should happen next.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
                Sorted by risk score
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3">Supplier</th>
                    <th className="px-3">Risk</th>
                    <th className="px-3">Trend</th>
                    <th className="px-3">Top Drivers</th>
                    <th className="px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                {highRiskSuppliers.map((s) => {
                const levelMap: any = {
                    HIGH: "High",
                    MODERATE: "Medium",
                    LOW: "Low"
                };

                return (
                    <tr key={s.supplier_id} className="rounded-2xl bg-slate-50">
                    <td className="rounded-l-2xl px-3 py-4 align-top">
                        <div className="font-medium text-slate-900">{s.name}</div>
                        <div className="mt-1 text-sm text-slate-600">
                        {s.country}
                        </div>
                    </td>

                    <td className="px-3 py-4 align-top">
                        <div className="flex items-center gap-3">
                        <div className="text-2xl font-semibold">{s.risk_score}</div>
                        <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                            levelClasses[levelMap[s.risk_level]]
                            }`}
                        >
                            {levelMap[s.risk_level]}
                        </span>
                        </div>
                    </td>

                    <td className="px-3 py-4 align-top">
                        <span className="text-sm font-medium text-red-600">
                        Rising
                        </span>
                    </td>

                    <td className="px-3 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                            {s.primary_driver}
                        </span>
                        </div>
                    </td>

                    <td className="rounded-r-2xl px-3 py-4 align-top">
                        <button className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200">
                        Review
                        </button>
                    </td>
                    </tr>
                );
                })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Risk Driver Mix</h2>
              <p className="mt-1 text-sm text-slate-600">
                Helps explain where current supplier exposure is coming from.
              </p>
            </div>

            <div className="space-y-4">
              {riskDrivers.map((driver) => (
                <div key={driver.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{driver.label}</span>
                    <span className="text-slate-500">{driver.value}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-slate-900"
                      style={{ width: `${driver.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Why this matters</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Do not show raw data only. Summarize the strongest drivers so the user
                immediately understands whether risk comes from operations, macro
                pressure, ownership changes, or logistics disruption.
              </p>
            </div> */}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Event & Alert Feed</h2>
              <p className="mt-1 text-sm text-slate-600">
                A live stream of external and internal events that may push a supplier
                toward disruption.
              </p>
            </div>
{/* 
            <div className="space-y-3">
              {eventFeed.map((event, index) => (
                <div
                  key={`${event.supplier}-${index}`}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {event.type}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${levelClasses[event.severity]}`}
                        >
                          {event.severity}
                        </span>
                      </div>
                      <p className="mt-3 font-medium text-slate-900">{event.supplier}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{event.detail}</p>
                    </div>
                    <div className="text-sm text-slate-500">{event.time}</div>
                  </div>
                </div>
              ))}
            </div> */}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">What the dashboard must answer</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">1. Who is at risk?</p>
                  <p className="mt-1">Rank suppliers by severity so the user can prioritize attention.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">2. Why are they at risk?</p>
                  <p className="mt-1">Show the top internal and macro factors behind the score.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">3. Is the risk getting worse?</p>
                  <p className="mt-1">Display a clear trend so users know whether to watch or escalate.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">4. What should happen next?</p>
                  <p className="mt-1">Provide light action guidance instead of leaving the user with raw alerts.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Recommended MVP Additions</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li className="rounded-2xl bg-slate-50 p-4">
                  Add a supplier-level risk score with low / medium / high / critical tags.
                </li>
                <li className="rounded-2xl bg-slate-50 p-4">
                  Add a risk trend indicator so users can detect deterioration early.
                </li>
                <li className="rounded-2xl bg-slate-50 p-4">
                  Add top driver explanations to improve trust and usability.
                </li>
                <li className="rounded-2xl bg-slate-50 p-4">
                  Add a simple recommended action field for each high-risk supplier.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
