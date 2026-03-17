import React, { useEffect, useMemo, useState } from "react";
import { getSupplierIntelligence } from "@/api/SupplierIntelligence";

type RiskStatus = "ok" | "warning" | "critical" | "unknown";

type RiskItem = {
  key: string;
  label: string;
  value: string | number | boolean | null;
  unit?: string;
  status: RiskStatus;
  message: string;
};

type RiskSection = {
  score: number;
  level: string;
  items: RiskItem[];
};

type SupplierInsights = {
  supplier_id: number;
  supplier_name: string;
  overall_supplier_risk: {
    score: number;
    level: string;
    primary_driver?: string | null;
  };
  sections: Record<string, RiskSection>;
};

type HiringData = {
  linkedin_company_name?: string;
  trend?: string;
  risk_level?: string;
  current_jobs?: number;
  previous_jobs?: number;
  insight?: string;
  snapshot_date?: string;
  message?: string;
};

type PortData = {
  name?: string | null;
  status?: string | null;
  score?: number | null;
  wait_hours?: number | null;
};

type SupplierIntelligenceResponse = {
  supplier: string;
  country: string;

  market_pressure?: {
    score: number;
    cost_pressure_percent: number;
    drivers: string[];
  };

  port?: PortData;
  registry?: unknown;
  hiring?: HiringData;
  supplier_insights?: SupplierInsights;

  commodities?: {
    metals?: unknown;
    forex?: unknown;
    energy?: unknown;
  };

  country_risk?: unknown;
  baseline_risk?: unknown;
  news_risk?: unknown;
  error?: string;
};

type Props = {
  supplierId: number;
};

const sectionOrder = ["operational", "dependency", "structural", "logistics"];

const levelBadgeStyles: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 ring-red-200",
  MODERATE: "bg-amber-100 text-amber-700 ring-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

const statusStyles: Record<RiskStatus, string> = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  critical: "bg-red-50 text-red-700 ring-red-200",
  unknown: "bg-slate-100 text-slate-600 ring-slate-200",
};

const cardGlowStyles: Record<RiskStatus, string> = {
  ok: "hover:border-emerald-200 hover:shadow-emerald-100/50",
  warning: "hover:border-amber-200 hover:shadow-amber-100/50",
  critical: "hover:border-red-200 hover:shadow-red-100/50",
  unknown: "hover:border-slate-200 hover:shadow-slate-100/50",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPrimitive(value: RiskItem["value"], unit?: string) {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function getLevelStyle(level?: string) {
  if (!level) return "bg-slate-100 text-slate-600 ring-slate-200";
  return levelBadgeStyles[level.toUpperCase()] || "bg-slate-100 text-slate-600 ring-slate-200";
}

function getScoreProgress(score?: number) {
  const safe = Math.max(0, Math.min(100, Number(score || 0)));
  if (safe >= 75) return "bg-red-500";
  if (safe >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function MetricCard({
  title,
  value,
  subtitle,
  badge,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {badge}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function SectionCard({
  name,
  section,
}: {
  name: string;
  section: RiskSection;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{formatLabel(name)}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Section score and supporting supplier risk indicators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
              getLevelStyle(section.level)
            )}
          >
            {section.level}
          </span>
          <div className="min-w-[120px]">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Score</span>
              <span>{section.score}/100</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all", getScoreProgress(section.score))}
                style={{ width: `${Math.max(0, Math.min(100, section.score))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {section.items?.map((item) => (
          <div
            key={item.key}
            className={cn(
              "group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm transition-all",
              cardGlowStyles[item.status]
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.key}</p>
              </div>
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                  statusStyles[item.status]
                )}
              >
                {item.status}
              </span>
            </div>

            <div className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
              {formatPrimitive(item.value, item.unit)}
            </div>

            <p className="text-sm leading-6 text-slate-600">{item.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function JsonPanel({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">Raw source payload for debugging and inspection.</p>
      </div>
      <pre className="max-h-[340px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function SupplierHeader({
  supplier,
  country,
  overall,
}: {
  supplier: string;
  country: string;
  overall?: SupplierInsights["overall_supplier_risk"];
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50" />
      <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/4 translate-x-1/4 rounded-full bg-sky-100/60 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-100/60 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              Supplier Intelligence Dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {supplier}
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Unified view of operational, structural, dependency, and logistics risk.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Country</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{country || "N/A"}</p>
            </div>

            {overall?.level ? (
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 ring-1 ring-inset",
                  getLevelStyle(overall.level)
                )}
              >
                <p className="text-xs font-medium uppercase tracking-wide">Overall Risk</p>
                <p className="mt-1 text-sm font-semibold">{overall.level}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Overall Supplier Risk"
            value={overall?.score ?? "N/A"}
            subtitle="Weighted score across all supplier risk sections."
            badge={
              overall?.level ? (
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                    getLevelStyle(overall.level)
                  )}
                >
                  {overall.level}
                </span>
              ) : null
            }
          />

          <MetricCard
            title="Primary Driver"
            value={overall?.primary_driver ? formatLabel(overall.primary_driver) : "N/A"}
            subtitle="Biggest current contributor to supplier risk."
          />

          <MetricCard
            title="Monitoring Status"
            value="Active"
            subtitle="Live intelligence feed loaded from backend services."
          />
        </div>
      </div>
    </div>
  );
}

const SupplierIntelligence: React.FC<Props> = ({ supplierId }) => {
  const [data, setData] = useState<SupplierIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawPanels, setShowRawPanels] = useState(false);
  const [error, setError] = useState<string | null>(null);
const marketPressure = data?.market_pressure;
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getSupplierIntelligence(supplierId);
        const payload = result?.data ? result.data : result;

        if (!mounted) return;

        if (payload?.error) {
          setError(payload.error);
          setData(null);
          return;
        }

        setData(payload);
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError("Failed to load supplier intelligence.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [supplierId]);

  const insights = data?.supplier_insights;
  const sections = useMemo(() => {
    if (!insights?.sections) return [];
    return sectionOrder
      .filter((key) => insights.sections[key])
      .map((key) => [key, insights.sections[key]] as const)
      .concat(
        Object.entries(insights.sections).filter(
          ([key]) => !sectionOrder.includes(key)
        ) as Array<[string, RiskSection]>
      );
  }, [insights]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-56 rounded-[28px] bg-white shadow-sm" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-40 rounded-3xl bg-white shadow-sm" />
            <div className="h-40 rounded-3xl bg-white shadow-sm" />
            <div className="h-40 rounded-3xl bg-white shadow-sm" />
          </div>
          <div className="h-96 rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200">
            Load Error
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Unable to load supplier intelligence</h2>
          <p className="mt-3 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hiring = data.hiring;
  const port = data.port;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6 sm:p-8">
        <div className="space-y-6">
          <SupplierHeader
            supplier={data.supplier}
            country={data.country}
            overall={insights?.overall_supplier_risk}
          />
          {marketPressure && (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Market Cost Pressure
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          External market forces affecting supplier production costs.
        </p>
      </div>

      <span
        className={cn(
          "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
          getScoreProgress(marketPressure.score)
        )}
      >
        Score {marketPressure.score}/100
      </span>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Pressure Score"
        value={marketPressure.score}
        subtitle="Aggregated commodity, energy, and FX pressure."
      />

      <MetricCard
        title="Estimated Cost Impact"
        value={`${marketPressure.cost_pressure_percent}%`}
        subtitle="Estimated supplier cost increase pressure."
      />

      <MetricCard
        title="Drivers"
        value={marketPressure.drivers.length}
        subtitle="Number of active market signals."
      />
    </div>

    {marketPressure.drivers?.length > 0 && (
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">
          Active Drivers
        </h4>

        <ul className="space-y-2">
          {marketPressure.drivers.map((d, i) => (
            <li
              key={i}
              className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {d}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Port Intelligence</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Current logistics exposure from the supplier’s export route.
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                      port?.status?.toLowerCase() === "critical"
                        ? "bg-red-100 text-red-700 ring-red-200"
                        : port?.status?.toLowerCase() === "warning" ||
                          port?.status?.toLowerCase() === "elevated"
                        ? "bg-amber-100 text-amber-700 ring-amber-200"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    )}
                  >
                    {port?.status || "Unknown"}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard
                    title="Port"
                    value={port?.name || "N/A"}
                    subtitle="Primary port related to this supplier."
                  />
                  <MetricCard
                    title="Health Score"
                    value={port?.score ?? "N/A"}
                    subtitle="Reported port health and congestion condition."
                  />
                  <MetricCard
                    title="Wait Time"
                    value={port?.wait_hours != null ? `${port.wait_hours} hrs` : "N/A"}
                    subtitle="Estimated queue or turnaround delay."
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Hiring Activity</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Organizational signal from supplier hiring momentum.
                  </p>
                </div>

                {hiring && !hiring.message ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">LinkedIn Company</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {hiring.linkedin_company_name || "N/A"}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Trend</p>
                        <p className="mt-1 font-semibold text-slate-900">{hiring.trend || "N/A"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Risk Level</p>
                        <p className="mt-1 font-semibold text-slate-900">{hiring.risk_level || "N/A"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Current Jobs</p>
                        <p className="mt-1 font-semibold text-slate-900">{hiring.current_jobs ?? "N/A"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Previous Jobs</p>
                        <p className="mt-1 font-semibold text-slate-900">{hiring.previous_jobs ?? "N/A"}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Insight</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {hiring.insight || "No insight available."}
                      </p>
                    </div>

                    <div className="text-xs text-slate-500">
                      Snapshot Date: {hiring.snapshot_date || "N/A"}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                    {hiring?.message || "No hiring insight available."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {insights ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Supplier Risk Sections
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Detailed breakdown of all risk sections and supporting items.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRawPanels((prev) => !prev)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  {showRawPanels ? "Hide Raw Data" : "Show Raw Data"}
                </button>
              </div>

              <div className="grid gap-6">
                {sections.map(([name, section]) => (
                  <SectionCard key={name} name={name} section={section} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-600 shadow-sm">
              Supplier risk sections are not available.
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <JsonPanel title="Country Risk" data={data.country_risk} />
            <JsonPanel title="News Risk" data={data.news_risk} />
          </div>

          {showRawPanels ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <JsonPanel title="Registry" data={data.registry} />
              <JsonPanel title="Commodities — Metals" data={data.commodities?.metals} />
              <JsonPanel title="Commodities — Forex" data={data.commodities?.forex} />
              <JsonPanel title="Commodities — Energy" data={data.commodities?.energy} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SupplierIntelligence;