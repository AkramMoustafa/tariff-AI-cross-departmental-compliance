// SupplierRiskInsights.tsx
// Advanced Insights based on supplier risk (MVP, static-derived + scenario sliders)
// Uses MUI only.

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Slider,
  Button,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

type SupplierInput = {
  legalName: string;
  countryIncorporation: string;
  manufacturingCountry: string;
  exportPort: string;
  invoicingCurrency: string;

  incoterm: string;
  paymentTermsDays: number | "";
  yearsInOperation: number | "";
  revenueBand: "Unknown" | "<$10M" | "$10–50M" | "$50–200M" | ">$200M";
  hasTradeComplianceCerts: boolean;
  hasInsurance: boolean;

  singleSite: boolean;
  backupFacility: boolean;
  avgLeadTimeDays: number | "";
  onTimeDeliveryPct: number | "";
  qualityIssuesPct: number | "";

  categoryVolumeSharePct: number | "";
  commodityLinkedPricing: boolean;

  // Optional future fields (safe if absent)
  // productCriticality?: "Low" | "Medium" | "High";
};

type RiskBreakdown = {
  market: number;
  policy: number;
  operational: number;
  counterparty: number;
  concentration: number;
  overall: number;
  notes: string[];
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const riskLevel = (score: number) => {
  if (score >= 70) return { label: "High", color: "error" as const };
  if (score >= 50) return { label: "Moderate", color: "warning" as const };
  return { label: "Low", color: "success" as const };
};

// --- Demo computeRisk (keep consistent with your SupplierIntake) ---
const isEmergingMarketExample = (countryCode: string) => {
  const emerging = new Set(["CN", "MX", "IN", "VN", "TH", "ID", "BR", "TR", "PH"]);
  return emerging.has(countryCode);
};
const isStableExample = (countryCode: string) => {
  const stable = new Set(["US", "CA", "DE", "NL", "SE", "NO", "DK", "CH", "JP", "SG", "GB", "FR"]);
  return stable.has(countryCode);
};

function computeRisk(input: SupplierInput): RiskBreakdown {
  const notes: string[] = [];

  let market = 50;
  let policy = 50;
  let operational = 50;
  let counterparty = 50;
  let concentration = 50;

  if (input.invoicingCurrency && input.invoicingCurrency !== "USD") {
    market += 10;
    notes.push("Non-USD invoicing increases FX exposure.");
  }
  if (input.commodityLinkedPricing) {
    market += 10;
    notes.push("Commodity-linked pricing increases market volatility.");
  }

  if (input.incoterm.toUpperCase().includes("EXW")) {
    market += 5;
    operational += 5;
    notes.push("EXW increases buyer exposure to logistics/freight variability.");
  }
  if (input.incoterm.toUpperCase().includes("DDP")) {
    market -= 5;
    operational -= 5;
    notes.push("DDP shifts more logistics variability to supplier (lower buyer exposure).");
  }

  if (isEmergingMarketExample(input.manufacturingCountry)) {
    policy += 10;
    notes.push("Manufacturing in an emerging-market region increases policy uncertainty (demo proxy).");
  }
  if (isStableExample(input.manufacturingCountry)) {
    policy -= 10;
    notes.push("Manufacturing in a stable-market region reduces policy uncertainty (demo proxy).");
  }

  if (!input.hasTradeComplianceCerts) {
    policy += 8;
    notes.push("Missing trade/compliance certifications increases regulatory friction risk.");
  }

  if (input.singleSite) {
    operational += 10;
    notes.push("Single-site manufacturing increases disruption risk.");
  }
  if (input.backupFacility) {
    operational -= 8;
    notes.push("Backup facility reduces operational disruption risk.");
  }

  if (typeof input.avgLeadTimeDays === "number") {
    if (input.avgLeadTimeDays >= 60) {
      operational += 8;
      notes.push("Long lead times increase schedule and disruption sensitivity.");
    } else if (input.avgLeadTimeDays <= 20) {
      operational -= 4;
      notes.push("Short lead times reduce schedule risk.");
    }
  }

  if (typeof input.onTimeDeliveryPct === "number") {
    if (input.onTimeDeliveryPct < 85) {
      operational += 12;
      notes.push("Low on-time delivery performance increases operational risk.");
    } else if (input.onTimeDeliveryPct >= 95) {
      operational -= 8;
      notes.push("High on-time delivery performance reduces operational risk.");
    }
  }

  if (typeof input.qualityIssuesPct === "number") {
    if (input.qualityIssuesPct >= 3) {
      operational += 10;
      notes.push("Elevated quality issue rate increases operational risk.");
    } else if (input.qualityIssuesPct <= 0.5) {
      operational -= 4;
      notes.push("Low quality issue rate reduces operational risk.");
    }
  }

  if (!input.exportPort.trim()) {
    operational += 4;
    notes.push("Unknown export port adds operational uncertainty.");
  }

  if (input.revenueBand === "Unknown") {
    counterparty += 5;
    notes.push("Unknown revenue band increases counterparty uncertainty.");
  } else if (input.revenueBand === "<$10M") {
    counterparty += 12;
    notes.push("Small revenue band increases counterparty risk (demo proxy).");
  } else if (input.revenueBand === ">$200M") {
    counterparty -= 10;
    notes.push("Large revenue band reduces counterparty risk (demo proxy).");
  }

  if (typeof input.yearsInOperation === "number") {
    if (input.yearsInOperation < 3) {
      counterparty += 10;
      notes.push("Low years-in-operation increases counterparty risk.");
    } else if (input.yearsInOperation >= 10) {
      counterparty -= 6;
      notes.push("Long operating history reduces counterparty risk.");
    }
  }

  if (typeof input.paymentTermsDays === "number") {
    if (input.paymentTermsDays <= 15) {
      counterparty += 6;
      notes.push("Short payment terms can indicate tighter supplier cash needs (demo proxy).");
    } else if (input.paymentTermsDays >= 60) {
      counterparty -= 4;
      notes.push("Longer payment terms can indicate stronger supplier position (demo proxy).");
    }
  }

  if (!input.hasInsurance) {
    counterparty += 5;
    notes.push("Missing insurance coverage increases counterparty impact severity.");
  }

  if (typeof input.categoryVolumeSharePct === "number") {
    if (input.categoryVolumeSharePct >= 50) {
      concentration += 20;
      notes.push("High volume dependency increases concentration risk.");
    } else if (input.categoryVolumeSharePct >= 25) {
      concentration += 10;
      notes.push("Moderate volume dependency increases concentration risk.");
    } else if (input.categoryVolumeSharePct <= 10) {
      concentration -= 8;
      notes.push("Low volume dependency reduces concentration risk.");
    }
  }

  market = clamp(market, 0, 100);
  policy = clamp(policy, 0, 100);
  operational = clamp(operational, 0, 100);
  counterparty = clamp(counterparty, 0, 100);
  concentration = clamp(concentration, 0, 100);

  const overall = Math.round(
    0.24 * market + 0.22 * policy + 0.24 * operational + 0.2 * counterparty + 0.1 * concentration,
  );

  return { market, policy, operational, counterparty, concentration, overall, notes };
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
        backgroundColor: "#ffffff",
      }}
    >
      <Typography fontSize={12} fontWeight={700} color="#64748b" textTransform="uppercase" mb={1}>
        {title}
      </Typography>
      <Typography fontSize={22} fontWeight={800} color="#0f172a" mb={0.5}>
        {value}
      </Typography>
      {subtitle ? (
        <Typography fontSize={13} color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Paper>
  );
}

function RiskRow({ label, score }: { label: string; score: number }) {
  const lvl = riskLevel(score);
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography fontWeight={700}>{label}</Typography>
        <Chip size="small" color={lvl.color} label={`${score} · ${lvl.label}`} />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 8,
          borderRadius: 6,
          backgroundColor: "#f1f5f9",
          "& .MuiLinearProgress-bar": { borderRadius: 6 },
        }}
      />
    </Paper>
  );
}

export default function SupplierRiskInsights() {
  const navigate = useNavigate();
  const location = useLocation();

  // Expect state passed from prior page; fall back to a safe demo object.
  const formData: SupplierInput =
    (location.state?.formData as SupplierInput) ??
    ({
      legalName: "Shenzhen Advanced Components Ltd.",
      countryIncorporation: "CN",
      manufacturingCountry: "CN",
      exportPort: "Yantian",
      invoicingCurrency: "CNY",
      incoterm: "FOB",
      paymentTermsDays: 30,
      yearsInOperation: 8,
      revenueBand: "$50–200M",
      hasTradeComplianceCerts: false,
      hasInsurance: true,
      singleSite: true,
      backupFacility: false,
      avgLeadTimeDays: 45,
      onTimeDeliveryPct: 92,
      qualityIssuesPct: 1.2,
      categoryVolumeSharePct: 32,
      commodityLinkedPricing: false,
    } as SupplierInput);

  const risk = useMemo(() => computeRisk(formData), [formData]);
  const overall = riskLevel(risk.overall);

  // Simple scenario sliders (demo)
  const [fxMovePct, setFxMovePct] = useState(5); // 0..20
  const [tariffPct, setTariffPct] = useState(10); // 0..25
  const [leadTimeShockDays, setLeadTimeShockDays] = useState(10); // 0..45
  const [baseMarginPct, setBaseMarginPct] = useState(35); // demo baseline

  // Lightweight impact model (illustrative; tune later)
  const scenario = useMemo(() => {
    // "Exposure weights" driven by risk dimensions (0..1)
    const fxExposure = clamp((risk.market - 40) / 60, 0, 1); // higher market risk => more FX/market sensitivity
    const policyExposure = clamp((risk.policy - 40) / 60, 0, 1);
    const opsExposure = clamp((risk.operational - 40) / 60, 0, 1);

    // Margin impacts (percentage points)
    const fxImpactPp = -(fxMovePct * 0.18) * fxExposure; // e.g., 10% FX move ~ -1.8pp at full exposure
    const tariffImpactPp = -(tariffPct * 0.12) * policyExposure; // 10% tariff ~ -1.2pp at full exposure
    const leadTimeImpactPp = -(leadTimeShockDays * 0.05) * opsExposure; // 20 days ~ -1.0pp at full exposure

    const totalImpactPp = fxImpactPp + tariffImpactPp + leadTimeImpactPp;
    const stressedMargin = clamp(baseMarginPct + totalImpactPp, 0, 100);

    // Lead-time shock also implies inventory/carrying cost narrative
    const carryingCostIdx = Math.round(clamp(leadTimeShockDays / 45, 0, 1) * 100);

    return {
      fxImpactPp,
      tariffImpactPp,
      leadTimeImpactPp,
      totalImpactPp,
      stressedMargin,
      carryingCostIdx,
    };
  }, [baseMarginPct, fxMovePct, leadTimeShockDays, risk.market, risk.operational, risk.policy, tariffPct]);

  const volumeShare = typeof formData.categoryVolumeSharePct === "number" ? formData.categoryVolumeSharePct : 0;

  const recommendations = useMemo(() => {
    const recs: { title: string; rationale: string }[] = [];

    if (risk.overall >= 50) {
      recs.push({
        title: "Require formal review and documented mitigation plan",
        rationale: "Moderate+ overall risk should not auto-approve; capture decision rationale for auditability.",
      });
    }

    if (risk.market >= 70 || formData.invoicingCurrency !== "USD") {
      recs.push({
        title: "Evaluate FX risk controls (hedge / pricing bands / currency clauses)",
        rationale: "Market exposure is elevated and/or invoicing is non-USD, increasing margin volatility.",
      });
    }

    if (risk.policy >= 60) {
      recs.push({
        title: "Strengthen trade compliance checks (certs, screening cadence, restricted-party checks)",
        rationale: "Policy exposure indicates higher tariff/sanctions/regulatory uncertainty.",
      });
    }

    if (risk.operational >= 60 || formData.singleSite) {
      recs.push({
        title: "Operational resilience: add backup capacity requirement or qualify an alternate supplier",
        rationale: "Single-site and/or operational risk increases disruption sensitivity.",
      });
    }

    if (volumeShare >= 25) {
      recs.push({
        title: "Set a volume cap and dual-source plan for category dependency",
        rationale: "Category share is material; diversification reduces concentration risk and improves continuity.",
      });
    }

    if (!formData.hasInsurance) {
      recs.push({
        title: "Require minimum insurance coverage and certificates on file",
        rationale: "Insurance reduces severity of counterparty events and contractual disputes.",
      });
    }

    // Always include one “next step”
    recs.push({
      title: "Schedule next re-screening",
      rationale: "For active suppliers, re-screening maintains current-state risk posture (e.g., quarterly for Moderate).",
    });

    return recs.slice(0, 6);
  }, [
    formData.hasInsurance,
    formData.invoicingCurrency,
    formData.singleSite,
    risk.market,
    risk.operational,
    risk.overall,
    risk.policy,
    volumeShare,
  ]);

  return (
    <Box sx={{ maxWidth: 1350, mx: "auto", mt: 6, mb: 8, px: 3 }}>
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
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#64748b",
                mb: 1,
              }}
            >
              Advanced Supplier Insights
            </Typography>

            <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
              {formData.legalName || "Supplier"}
            </Typography>

            <Typography fontSize={14} color="#475569">
              Manufacturing: {formData.manufacturingCountry} • Currency: {formData.invoicingCurrency} • Incoterm:{" "}
              {formData.incoterm} • Category Share: {volumeShare ? `${volumeShare}%` : "—"}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip label={`${risk.overall} · ${overall.label}`} color={overall.color} />
            <Button
              variant="outlined"
              sx={{ borderRadius: "10px", textTransform: "none" }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Stack>
        </Stack>

        {/* Executive metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Stressed Margin"
              value={`${scenario.stressedMargin.toFixed(1)}%`}
              subtitle={`Base ${baseMarginPct.toFixed(1)}% • Scenario impact ${scenario.totalImpactPp.toFixed(1)}pp`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Policy Shock Sensitivity"
              value={`${Math.abs(scenario.tariffImpactPp).toFixed(1)}pp`}
              subtitle={`Tariff +${tariffPct}% • Weighted by policy exposure`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Carrying Cost Index"
              value={`${scenario.carryingCostIdx}/100`}
              subtitle={`Lead time shock +${leadTimeShockDays} days • Weighted by operational exposure`}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          {/* Left: Risk + Drivers */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }}>
              Live Risk Drivers
            </Typography>

            <Stack spacing={2} mb={3}>
              <RiskRow label="Market Exposure" score={risk.market} />
              <RiskRow label="Policy Exposure" score={risk.policy} />
              <RiskRow label="Operational Risk" score={risk.operational} />
              <RiskRow label="Counterparty Risk" score={risk.counterparty} />
              <RiskRow label="Concentration Risk" score={risk.concentration} />
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f8fafc",
              }}
            >
              <Typography fontWeight={800} mb={1}>
                Primary Drivers (System-Generated)
              </Typography>
              {risk.notes?.length ? (
                <Stack spacing={1}>
                  {risk.notes.slice(0, 7).map((n, idx) => (
                    <Typography key={idx} fontSize={13} color="#475569">
                      • {n}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography fontSize={13} color="text.secondary">
                  No drivers were generated for this record.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Right: Scenario analysis + recommendations */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }}>
              Scenario Analysis
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
                mb: 3,
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontWeight={700}>Base Margin (%)</Typography>
                    <Typography fontWeight={700}>{baseMarginPct.toFixed(1)}%</Typography>
                  </Stack>
                  <Slider
                    value={baseMarginPct}
                    onChange={(_, v) => setBaseMarginPct(v as number)}
                    min={5}
                    max={70}
                    step={0.5}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontWeight={700}>FX Move (%)</Typography>
                    <Typography fontWeight={700}>{fxMovePct}%</Typography>
                  </Stack>
                  <Slider value={fxMovePct} onChange={(_, v) => setFxMovePct(v as number)} min={0} max={20} step={1} />
                  <Typography fontSize={12} color="text.secondary">
                    Estimated impact: {scenario.fxImpactPp.toFixed(2)}pp
                  </Typography>
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontWeight={700}>Tariff Increase (%)</Typography>
                    <Typography fontWeight={700}>{tariffPct}%</Typography>
                  </Stack>
                  <Slider
                    value={tariffPct}
                    onChange={(_, v) => setTariffPct(v as number)}
                    min={0}
                    max={25}
                    step={1}
                  />
                  <Typography fontSize={12} color="text.secondary">
                    Estimated impact: {scenario.tariffImpactPp.toFixed(2)}pp
                  </Typography>
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontWeight={700}>Lead Time Shock (days)</Typography>
                    <Typography fontWeight={700}>+{leadTimeShockDays}</Typography>
                  </Stack>
                  <Slider
                    value={leadTimeShockDays}
                    onChange={(_, v) => setLeadTimeShockDays(v as number)}
                    min={0}
                    max={45}
                    step={1}
                  />
                  <Typography fontSize={12} color="text.secondary">
                    Estimated impact: {scenario.leadTimeImpactPp.toFixed(2)}pp
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f8fafc",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography fontWeight={800}>Recommended Actions</Typography>
                <Chip
                  size="small"
                  label={risk.overall >= 70 ? "Escalate" : risk.overall >= 50 ? "Review" : "Monitor"}
                  color={risk.overall >= 70 ? "error" : risk.overall >= 50 ? "warning" : "success"}
                />
              </Stack>

              <Stack spacing={2}>
                {recommendations.map((r, idx) => (
                  <Box key={idx}>
                    <Typography fontWeight={800} fontSize={14} color="#0f172a">
                      {idx + 1}. {r.title}
                    </Typography>
                    <Typography fontSize={13} color="#475569">
                      {r.rationale}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography fontWeight={800} mb={1}>
                Reviewer Notes (optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Capture mitigation plan, approval conditions, or scenario assumptions..."
              />
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Footer actions */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            variant="outlined"
            sx={{ borderRadius: "10px", textTransform: "none" }}
            onClick={() => navigate("/supplier-risk-profile", { state: { formData } })}
          >
            View Risk Profile
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              px: 3,
              fontWeight: 700,
              backgroundColor: "#1e3a8a",
              "&:hover": { backgroundColor: "#1e40af" },
            }}
            onClick={() => console.log("Export insights (demo):", { formData, risk, scenario })}
          >
            Export Insights
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}