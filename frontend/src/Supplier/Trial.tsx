import React , {useState, useEffect} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  Globe,
  Ship,
  TrendingUp,
  Factory,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSuppliers,getWorseningSuppliers, getHighRiskSuppliers ,getRiskDriverMix } from "../api/SupplierIntelligence";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";



const topMacroRisks = [
  {
    label: "Oil",
    change: "+12%",
    detail: "30-day move",
    icon: CircleDollarSign,
  },
  {
    label: "USD",
    change: "+5%",
    detail: "vs supplier basket",
    icon: TrendingUp,
  },
  {
    label: "Freight",
    change: "+8%",
    detail: "global lanes",
    icon: Ship,
  },
];

const supplierRiskData = [
  { name: "Low", value: 46 },
  { name: "Medium", value: 38 },
  { name: "High", value: 24 },
  { name: "Critical", value: 16 },
];

const trendData = [
  { month: "Jan", risk: 41, oil: 36 },
  { month: "Feb", risk: 44, oil: 40 },
  { month: "Mar", risk: 47, oil: 51 },
  { month: "Apr", risk: 49, oil: 48 },
  { month: "May", risk: 54, oil: 60 },
  { month: "Jun", risk: 58, oil: 63 },
  { month: "Jul", risk: 62, oil: 68 },
];
const normalizeSupplier = (s: any) => {
  const levelMap: any = {
    HIGH: "High",
    MODERATE: "Medium",
    LOW: "Low",
  };

  return {
    name: s.name,
    country: s.country,
    score: s.risk_score,
    level: levelMap[s.risk_level],
    driver: s.primary_driver,
  };
};

const radialData = [{ name: "Exposure", value: 62, fill: "currentColor" }];

const riskBadge = (score: number) => {
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 55) return "Medium";
  return "Low";
};

const badgeClasses: Record<string, string> = {
  Critical:
    "bg-red-500/15 text-red-700 ring-1 ring-inset ring-red-500/30 dark:text-red-300",
  High: "bg-amber-500/15 text-amber-700 ring-1 ring-inset ring-amber-500/30 dark:text-amber-300",
  Medium:
    "bg-blue-500/15 text-blue-700 ring-1 ring-inset ring-blue-500/30 dark:text-blue-300",
  Low: "bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:text-emerald-300",
};

export default function SupplierRiskDashboard() {

  const navigate = useNavigate();
const [totalSuppliers, setTotalSuppliers] = useState(0);
const [highRiskSuppliers, setHighRiskSuppliers] = useState<any[]>([]);
const [highRiskCount, setHighRiskCount] = useState(0);
const [riskDrivers, setRiskDrivers] = useState<any[]>([]);
const [worseningCount, setWorseningCount] = useState(0);

const kpis = [
  {
    title: "Total Suppliers",
    value: totalSuppliers.toString(),
    delta: "All tracked",
    icon: Factory,
    accent: "from-slate-900 to-slate-700",
  },
  {
    title: "High Risk Suppliers",
    value: highRiskCount.toString(),
    delta: "Needs attention",
    icon: AlertTriangle,
    accent: "from-amber-600 to-orange-500",
  },
  {
    title: "Worsening Suppliers",
    value: worseningCount.toString(),
    delta: "Trending up",
    icon: TrendingUp,
    accent: "from-blue-600 to-cyan-500",
  },
  {
    title: "Top Risk Driver",
    value: riskDrivers[0]?.label || "-",
    delta: "Primary factor",
    icon: Activity,
    accent: "from-violet-600 to-fuchsia-500",
  },
];
useEffect(() => {
  async function loadDashboard() {
    try {
      const suppliers = await getSuppliers();
      setTotalSuppliers(suppliers.length);

      const highRisk = await getHighRiskSuppliers();
      setHighRiskSuppliers(highRisk.suppliers);
      setHighRiskCount(highRisk.count);

      const worsening = await getWorseningSuppliers();
      setWorseningCount(worsening.count);

      const drivers = await getRiskDriverMix();
      setRiskDrivers(drivers);
    } catch (e) {
      console.error(e);
    }
  }

  loadDashboard();
}, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff_40%,_#ffffff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(to_bottom,_#020617,_#0f172a_40%,_#111827_100%)] dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live macro exposure monitoring
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Supplier Risk Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
              Track macro-driven supplier vulnerability across FX, commodities,
              and freight. Prioritize the suppliers most exposed to external cost
              shocks before they become operational disruptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button className="rounded-2xl px-5 shadow-lg shadow-slate-900/10">
              Run Scenario
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl border-slate-300/70 bg-white/70 px-5 backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              Export Snapshot
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Card className="group overflow-hidden rounded-3xl border-white/60 bg-white/75 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/5">
                  <CardContent className="relative p-6">
                    <div
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
                    />
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.title}
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight">
                         {item.value}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
                        <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {item.delta}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <Card className="rounded-3xl border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">Risk Momentum</CardTitle>
                  <CardDescription>
                    Macro pressure index vs supplier risk trend
                  </CardDescription>
                </div>
                <Badge className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  7-month view
                </Badge>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="currentColor" stopOpacity={0.24} />
                          <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.14} />
                      <XAxis dataKey="month" stroke="currentColor" opacity={0.45} />
                      <YAxis stroke="currentColor" opacity={0.45} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="oil"
                        stroke="currentColor"
                        className="text-slate-400"
                        fill="none"
                        strokeDasharray="6 6"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="risk"
                        stroke="currentColor"
                        className="text-slate-900 dark:text-white"
                        fill="url(#riskFill)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="grid gap-6"
          >
            <Card className="rounded-3xl border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <CardHeader>
                <CardTitle className="text-xl">Top Macro Risks</CardTitle>
                <CardDescription>
                  Current moves shaping supplier pressure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topMacroRisks.map((risk) => {
                  const Icon = risk.icon;
                  return (
                    <div
                      key={risk.label}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-2.5 shadow-sm dark:bg-white/10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{risk.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {risk.detail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{risk.change}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          Rising pressure
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Exposure Score</CardTitle>
                <CardDescription>
                  Portfolio-wide macro vulnerability
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-36 w-36 text-slate-900 dark:text-white">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="72%"
                      outerRadius="100%"
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar dataKey="value" cornerRadius={18} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-4xl font-semibold">62</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Elevated but manageable. FX-sensitive sectors require the most
                    attention this week.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.25fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            <Card className="rounded-3xl border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <CardHeader>
                <CardTitle className="text-xl">Risk Distribution</CardTitle>
                <CardDescription>
                  Suppliers grouped by current macro exposure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierRiskData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.14} />
                      <XAxis dataKey="name" stroke="currentColor" opacity={0.45} />
                      <YAxis stroke="currentColor" opacity={0.45} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[14, 14, 4, 4]} className="text-slate-900 dark:text-white" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="rounded-3xl border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Most Exposed Suppliers</CardTitle>
                  <CardDescription>
                    Ranked by FX and commodity vulnerability
                  </CardDescription>
                </div>
                <Button variant="ghost" className="rounded-2xl">
                  View all <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
{highRiskSuppliers.map((s) => {
  const supplier = normalizeSupplier(s);
  const label = supplier.level;

  return (
    <div
      key={supplier.name}
      onClick={() => navigate("/suppliers")}
      className="cursor-pointer rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-base font-semibold">{supplier.name}</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses[label]}`}
            >
              {label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {supplier.country}
          </p>
        </div>

        <div className="flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Primary driver
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            {supplier.driver || "No primary driver available"}
          </p>
        </div>

        <div className="w-24 text-right">
          <p className="text-2xl font-semibold">{supplier.score}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Risk score
          </p>
        </div>
      </div>
    </div>
  );
})}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
