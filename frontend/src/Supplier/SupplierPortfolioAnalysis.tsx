
// SupplierPortfolioAnalysis.tsx
// Portfolio layer: compare suppliers (risk + Monte Carlo + “returns”) and model outsourcing/allocation options.
// Uses MUI only (+ optional react-router for navigation).
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Slider,
  Button,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

type RiskScores = {
  overall: number;
  market: number;
  policy: number;
  operational: number;
  counterparty: number;
  concentration: number;
};

type SupplierRow = {
  id: string;
  name: string;
  country: string;
  currency: string;
  incoterm: string;

  // “Returns / performance” style metrics (demo)
  otifPct: number; // on-time in-full
  defectPct: number;
  netSavingsPct: number; // savings vs baseline

  // Risk + simulation
  risk: RiskScores;
  budget: number; // budget threshold for this lane / product family
  mcSamples: number[]; // landed-cost samples (Monte Carlo output)
  topDriver: string; // tornado-style top sensitivity driver
  totalSwing: number; // tornado-style swing size (absolute $)
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const riskLevel = (score: number) => {
  if (score >= 70) return { label: "High", color: "error" as const };
  if (score >= 50) return { label: "Moderate", color: "warning" as const };
  return { label: "Low", color: "success" as const };
};

const formatMoney = (v: number) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`;
  return `${sign}$${Math.round(abs)}`;
};

const percentile = (sortedAsc: number[], p: number) => {
  if (!sortedAsc.length) return 0;
  const idx = clamp((p / 100) * (sortedAsc.length - 1), 0, sortedAsc.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  const w = idx - lo;
  return sortedAsc[lo] * (1 - w) + sortedAsc[hi] * w;
};

function summarizeSamples(samples: number[], budget: number) {
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / (sorted.length || 1);
  const p50 = percentile(sorted, 50);
  const p90 = percentile(sorted, 90);
  const probExceed = sorted.length
    ? Math.round((sorted.filter((x) => x > budget).length / sorted.length) * 100)
    : 0;
  return { mean, p50, p90, probExceed };
}

/**
 * Mixture approximation: build a blended “portfolio” distribution from supplier distributions using weights.
 * This keeps everything deterministic and fast for UI demos:
 * - We map an index i to each supplier’s i-th quantile-ish sample (sorted list), then weighted-sum.
 * - Result is a blended landed-cost sample array with the same length as the shortest supplier array.
 */
function blendDistributions(
  a: number[],
  b: number[],
  wA: number, // 0..1
) {
  const A = [...a].sort((x, y) => x - y);
  const B = [...b].sort((x, y) => x - y);
  const n = Math.min(A.length, B.length);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(wA * A[i] + (1 - wA) * B[i]);
  }
  return out;
}

// -----------------------------
// Demo supplier portfolio data
// -----------------------------
const SUPPLIERS: SupplierRow[] = [
  {
    id: "A",
    name: "Shenzhen Advanced Components Ltd.",
    country: "China",
    currency: "CNY",
    incoterm: "FOB",
    otifPct: 92,
    defectPct: 1.2,
    netSavingsPct: 3.8,
    risk: {
      overall: 63,
      market: 72,
      policy: 65,
      operational: 40,
      counterparty: 55,
      concentration: 58,
    },
    budget: 2_650_000,
    mcSamples: [
      2_450_000, 2_480_000, 2_500_000, 2_520_000, 2_550_000, 2_580_000, 2_600_000, 2_620_000,
      2_650_000, 2_680_000, 2_700_000, 2_720_000, 2_750_000, 2_780_000, 2_800_000, 2_850_000,
    ],
    topDriver: "FX rate",
    totalSwing: 260_000,
  },
  {
    id: "B",
    name: "Monterrey Precision Manufacturing S.A.",
    country: "Mexico",
    currency: "USD",
    incoterm: "DDP",
    otifPct: 96,
    defectPct: 0.7,
    netSavingsPct: 1.6,
    risk: {
      overall: 48,
      market: 44,
      policy: 52,
      operational: 46,
      counterparty: 45,
      concentration: 40,
    },
    budget: 2_650_000,
    mcSamples: [
      2_500_000, 2_520_000, 2_540_000, 2_560_000, 2_580_000, 2_600_000, 2_610_000, 2_620_000,
      2_630_000, 2_640_000, 2_650_000, 2_660_000, 2_670_000, 2_680_000, 2_700_000, 2_720_000,
    ],
    topDriver: "Ocean freight",
    totalSwing: 180_000,
  },
];

function scorecardVerdict(overallRisk: number, probExceed: number) {
  // Simple, explainable gating rule (tune later)
  if (overallRisk >= 70 || probExceed >= 50) return { label: "Escalation Required", color: "error" as const };
  if (overallRisk >= 50 || probExceed >= 30) return { label: "Review Required", color: "warning" as const };
  return { label: "Approved", color: "success" as const };
}

export default function SupplierPortfolioAnalysis() {
  const navigate = useNavigate();

  const [allocA, setAllocA] = useState<number>(50); // % allocation to Supplier A
  const wA = allocA / 100;

  const A = SUPPLIERS[0];
  const B = SUPPLIERS[1];
  const budget = Math.min(A.budget, B.budget);

  const statsA = useMemo(() => summarizeSamples(A.mcSamples, A.budget), [A.mcSamples, A.budget]);
  const statsB = useMemo(() => summarizeSamples(B.mcSamples, B.budget), [B.mcSamples, B.budget]);

  const blendedSamples = useMemo(() => blendDistributions(A.mcSamples, B.mcSamples, wA), [A.mcSamples, B.mcSamples, wA]);
  const statsBlend = useMemo(() => summarizeSamples(blendedSamples, budget), [blendedSamples, budget]);

  const blendedRisk = useMemo(() => {
    // Weighted average for an MVP; later you can use max() for “weakest link” dimensions if desired.
    const dims: (keyof RiskScores)[] = ["overall", "market", "policy", "operational", "counterparty", "concentration"];
    const out = {} as RiskScores;
    dims.forEach((k) => {
      out[k] = Math.round(wA * A.risk[k] + (1 - wA) * B.risk[k]);
    });
    return out;
  }, [A.risk, B.risk, wA]);

  const verdict = useMemo(
    () => scorecardVerdict(blendedRisk.overall, statsBlend.probExceed),
    [blendedRisk.overall, statsBlend.probExceed],
  );

  const exposureNotes = useMemo(() => {
    const notes: string[] = [];
    if (allocA >= 70) notes.push("High concentration in Supplier A increases disruption and policy sensitivity.");
    if (allocA <= 30) notes.push("Heavier allocation to Supplier B lowers downside but may introduce capacity/lead-time constraints.");
    if (statsBlend.probExceed >= 30) notes.push("Budget-breach probability is material; tighten commercial terms or adjust mix.");
    if (blendedRisk.market >= 60) notes.push("Market exposure elevated; consider FX clauses / hedging / price bands.");
    if (blendedRisk.policy >= 60) notes.push("Policy exposure elevated; increase compliance screening cadence.");
    return notes.slice(0, 5);
  }, [allocA, statsBlend.probExceed, blendedRisk.market, blendedRisk.policy]);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", mt: 6, mb: 8, px: 3 }}>
      <Box
        sx={{
          background: "#ffffff",
          borderRadius: "20px",
          p: 5,
          border: "1px solid #e5e7eb",
          boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} mb={3}>
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#64748b",
                mb: 1,
              }}
            >
              Supplier Portfolio Strategy
            </Typography>

            <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
              Multi-supplier risk / return comparison + outsourcing options
            </Typography>

            <Typography sx={{ fontSize: 14, color: "#475569", mt: 0.5 }}>
              Compare suppliers, then model allocation mixes to reduce downside risk while protecting cost outcomes.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              sx={{ borderRadius: "10px", textTransform: "none" }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#0f172a",
                "&:hover": { backgroundColor: "#1e293b" },
              }}
              onClick={() =>
                console.log("Export portfolio (demo)", {
                  allocA,
                  allocB: 100 - allocA,
                  blendedRisk,
                  statsBlend,
                })
              }
            >
              Export
            </Button>
          </Stack>
        </Stack>

        {/* Comparison table */}
        <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 800 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Risk (Overall)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Monte Carlo (Mean / P90)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Prob &gt; Budget</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Returns / Performance</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Sensitivity</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {[
                { s: A, stats: statsA },
                { s: B, stats: statsB },
              ].map(({ s, stats }) => {
                const lvl = riskLevel(s.risk.overall);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Typography fontWeight={800}>{s.name}</Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {s.country} • {s.currency} • {s.incoterm}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" color={lvl.color} label={`${s.risk.overall} · ${lvl.label}`} />
                      </Stack>
                      <Typography fontSize={12} color="text.secondary" mt={0.5}>
                        Mkt {s.risk.market} • Pol {s.risk.policy} • Ops {s.risk.operational}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>{formatMoney(stats.mean)} (mean)</Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {formatMoney(stats.p90)} (P90)
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={800}>{stats.probExceed}%</Typography>
                      <Typography fontSize={13} color="text.secondary">
                        Budget {formatMoney(s.budget)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={13}>
                        OTIF: <strong>{s.otifPct}%</strong> • Defects: <strong>{s.defectPct}%</strong>
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        Net savings vs baseline: <strong>{s.netSavingsPct}%</strong>
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={13}>
                        Top driver: <strong>{s.topDriver}</strong>
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        Total swing: <strong>{formatMoney(s.totalSwing)}</strong>
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: "10px", textTransform: "none" }}
                          onClick={() => navigate("/supplier-risk-profile", { state: { supplierId: s.id } })}
                        >
                          Risk
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: "10px", textTransform: "none" }}
                          onClick={() => navigate("/supplier-risk-insights", { state: { supplierId: s.id } })}
                        >
                          Insights
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        <Divider sx={{ my: 5 }} />

        {/* Allocation / outsourcing options */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <Typography fontSize={18} fontWeight={900} mb={1}>
                Outsourcing / Allocation Options
              </Typography>
              <Typography fontSize={13} color="text.secondary" mb={3}>
                Adjust the mix and observe blended downside risk and budget breach probability.
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontWeight={800}>Allocation</Typography>
                    <Typography fontWeight={800}>
                      {A.id}: {allocA}% • {B.id}: {100 - allocA}%
                    </Typography>
                  </Stack>
                  <Slider value={allocA} min={0} max={100} step={5} onChange={(_, v) => setAllocA(v as number)} />
                  <Typography fontSize={12} color="text.secondary">
                    Budget threshold used for blended view: <strong>{formatMoney(budget)}</strong>
                  </Typography>
                </Box>

                <Box>
                  <Typography fontWeight={800} mb={1}>
                    Portfolio Verdict
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip color={verdict.color} label={verdict.label} />
                    <Chip
                      size="small"
                      label={`Risk ${blendedRisk.overall} · ${riskLevel(blendedRisk.overall).label}`}
                      color={riskLevel(blendedRisk.overall).color}
                    />
                    <Chip size="small" label={`${statsBlend.probExceed}% > budget`} />
                  </Stack>
                </Box>

                <Box>
                  <Typography fontWeight={800} mb={1}>
                    Blended Monte Carlo Snapshot
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "14px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography fontWeight={800}>Probability of exceeding budget</Typography>
                      <Typography fontWeight={900} fontSize={18}>
                        {statsBlend.probExceed}%
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={clamp(statsBlend.probExceed, 0, 100)}
                      sx={{ height: 10, borderRadius: 6, mb: 2 }}
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography fontSize={12} color="text.secondary">
                          Mean
                        </Typography>
                        <Typography fontWeight={900}>{formatMoney(statsBlend.mean)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography fontSize={12} color="text.secondary">
                          P50
                        </Typography>
                        <Typography fontWeight={900}>{formatMoney(statsBlend.p50)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography fontSize={12} color="text.secondary">
                          P90
                        </Typography>
                        <Typography fontWeight={900}>{formatMoney(statsBlend.p90)}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                {exposureNotes.length ? (
                  <Box>
                    <Typography fontWeight={900} mb={1}>
                      System Notes
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: "14px", border: "1px solid #e5e7eb" }}
                    >
                      <Stack spacing={1}>
                        {exposureNotes.map((n, i) => (
                          <Typography key={i} fontSize={13} color="#475569">
                            • {n}
                          </Typography>
                        ))}
                      </Stack>
                    </Paper>
                  </Box>
                ) : null}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: "16px", border: "1px solid #e5e7eb" }}>
              <Typography fontSize={18} fontWeight={900} mb={1}>
                Recommended Mix (MVP Logic)
              </Typography>
              <Typography fontSize={13} color="text.secondary" mb={3}>
                Simple, explainable heuristic. Replace with optimization later.
              </Typography>

              <Stack spacing={2}>
                <Paper
                  elevation={0}
                  sx={{ p: 2.5, borderRadius: "14px", border: "1px solid #e5e7eb", backgroundColor: "#f8fafc" }}
                >
                  <Typography fontWeight={900} mb={0.5}>
                    Suggested allocation
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">
                    If budget-breach probability is high, shift toward the lower-downside supplier while watching capacity.
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography fontSize={13}>
                    Current: <strong>{A.id} {allocA}%</strong> / <strong>{B.id} {100 - allocA}%</strong>
                  </Typography>

                  <Typography fontSize={13} mt={1}>
                    Heuristic suggestion:{" "}
                    <strong>
                      {statsBlend.probExceed >= 30 ? `${A.id} 40% / ${B.id} 60%` : `${A.id} 50% / ${B.id} 50%`}
                    </strong>
                  </Typography>
                </Paper>

                <Button
                  variant="outlined"
                  sx={{ borderRadius: "10px", textTransform: "none" }}
                  onClick={() => setAllocA(statsBlend.probExceed >= 30 ? 40 : 50)}
                >
                  Apply Suggested Mix
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 800,
                    backgroundColor: "#1e3a8a",
                    "&:hover": { backgroundColor: "#1e40af" },
                  }}
                  onClick={() =>
                    navigate("/TradeAuthorization", {
                      state: {
                        portfolio: {
                          allocation: { [A.id]: allocA, [B.id]: 100 - allocA },
                          blendedRisk,
                          monteCarlo: statsBlend,
                          budget,
                        },
                      },
                    })
                  }
                >
                  Proceed to Pre-PO with This Mix
                </Button>

                <Typography fontSize={12} color="text.secondary">
                  Note: this demo blends distributions via weighted quantiles. For production, run true mixture sampling and
                  incorporate constraints (capacity, MOQ, lead times, qualification cost).
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}