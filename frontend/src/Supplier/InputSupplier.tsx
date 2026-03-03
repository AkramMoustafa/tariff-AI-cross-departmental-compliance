// SupplierIntake.tsx
// Procurement-entered supplier profile → system-derived risk scores (static/rule-based).
// Uses MUI only. Drop into your app and route to it from PrePOIntake.

import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Divider,
  Chip,
  LinearProgress,
  Stack,
  Button,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
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

const isEmergingMarketExample = (countryCode: string) => {
  // This is intentionally a small demo list; replace with your own data source later.
  const emerging = new Set(["CN", "MX", "IN", "VN", "TH", "ID", "BR", "TR", "PH"]);
  return emerging.has(countryCode);
};

const isStableExample = (countryCode: string) => {
  const stable = new Set(["US", "CA", "DE", "NL", "SE", "NO", "DK", "CH", "JP", "SG", "GB", "FR"]);
  return stable.has(countryCode);
};

function computeRisk(input: SupplierInput): RiskBreakdown {
  const notes: string[] = [];

  // Start at neutral/moderate baseline.
  let market = 50;
  let policy = 50;
  let operational = 50;
  let counterparty = 50;
  let concentration = 50;

  // -------------------------
  // Market Risk (FX/commodity/freight sensitivity)
  // -------------------------
  if (input.invoicingCurrency && input.invoicingCurrency !== "USD") {
    market += 10;
    notes.push("Non-USD invoicing increases FX exposure.");
  }

  if (input.commodityLinkedPricing) {
    market += 10;
    notes.push("Commodity-linked pricing increases market volatility.");
  }

  // Incoterms: buyer exposure differs; very simplified mapping
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

  // -------------------------
  // Policy Risk (tariff/sanctions/regulatory exposure proxy)
  // -------------------------
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

  // -------------------------
  // Operational Risk (delivery/quality/resilience)
  // -------------------------
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

  // Port proxy (very simple): blank/unknown increases uncertainty
  if (!input.exportPort.trim()) {
    operational += 4;
    notes.push("Unknown export port adds operational uncertainty.");
  }

  
  // -------------------------
  // Counterparty Risk (financial resilience proxy)
  // -------------------------
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

  // Clamp all to 0–100
  market = clamp(market, 0, 100);
  policy = clamp(policy, 0, 100);
  operational = clamp(operational, 0, 100);
  counterparty = clamp(counterparty, 0, 100);
  concentration = clamp(concentration, 0, 100);

  // Weighted overall score (tune weights as you like)
  const overall = Math.round(
    0.24 * market +
      0.22 * policy +
      0.24 * operational +
      0.20 * counterparty +
      0.10 * concentration,
  );

  return { market, policy, operational, counterparty, concentration, overall, notes };
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    fontSize: 14,
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#1e3a8a", borderWidth: 1.5 },
  },
};

const sectionCard = {
  p: 4,
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
};

function RiskBar({
  label,
  score,
  helper,
}: {
  label: string;
  score: number;
  helper?: string;
}) {
  const lvl = riskLevel(score);
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #e5e7eb" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontWeight={700}>{label}</Typography>
          {helper ? (
            <Tooltip title={helper}>
              <Typography sx={{ fontSize: 12, opacity: 0.6, cursor: "help" }}>ⓘ</Typography>
            </Tooltip>
          ) : null}
        </Box>
        <Chip size="small" color={lvl.color} label={`${score} · ${lvl.label}`} />
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 10,
          borderRadius: 6,
          backgroundColor: "#f1f5f9",
          "& .MuiLinearProgress-bar": { borderRadius: 6 },
        }}
      />
    </Paper>
  );
}

export default function SupplierIntake() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SupplierInput>({
    legalName: "",
    countryIncorporation: "US",
    manufacturingCountry: "CN",
    exportPort: "",
    invoicingCurrency: "USD",

    incoterm: "FOB",
    paymentTermsDays: 30,
    yearsInOperation: "",
    revenueBand: "Unknown",
    hasTradeComplianceCerts: false,
    hasInsurance: true,

    singleSite: true,
    backupFacility: false,
    avgLeadTimeDays: 45,
    onTimeDeliveryPct: 92,
    qualityIssuesPct: 1.2,

    categoryVolumeSharePct: 25,
    commodityLinkedPricing: false,
  });

  const risk = useMemo(() => computeRisk(form), [form]);

  const setField = <K extends keyof SupplierInput>(key: K, value: SupplierInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const overallLevel = riskLevel(risk.overall);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 6, mb: 8, px: 3 }}>
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
          Supplier Intake
        </Typography>

        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0f172a", mb: 1 }}>
          Create Supplier Profile (Procurement Entered)
        </Typography>

        <Typography sx={{ fontSize: 14, color: "#475569", mb: 4 }}>
          Enter structured supplier facts. The system derives risk categories and an overall risk score for downstream
          landed cost / margin modeling.
        </Typography>

        <Grid container spacing={3}>
          {/* Left: Inputs */}
          <Grid item xs={12} md={12}>
            <Paper elevation={0} sx={{ ...sectionCard }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>
                Supplier Facts
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Supplier Legal Name"
                    size="small"
                    value={form.legalName}
                    sx={inputSx}
                    onChange={(e) => setField("legalName", e.target.value)}
                    placeholder="e.g., Shenzhen Advanced Components Ltd."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Country of Incorporation"
                    size="small"
                    value={form.countryIncorporation}
                    sx={inputSx}
                    onChange={(e) => setField("countryIncorporation", e.target.value)}
                  >
                    <MenuItem value="US">United States (US)</MenuItem>
                    <MenuItem value="CA">Canada (CA)</MenuItem>
                    <MenuItem value="DE">Germany (DE)</MenuItem>
                    <MenuItem value="MX">Mexico (MX)</MenuItem>
                    <MenuItem value="CN">China (CN)</MenuItem>
                    <MenuItem value="VN">Vietnam (VN)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Primary Manufacturing Country"
                    size="small"
                    value={form.manufacturingCountry}
                    sx={inputSx}
                    onChange={(e) => setField("manufacturingCountry", e.target.value)}
                  >
                    <MenuItem value="US">United States (US)</MenuItem>
                    <MenuItem value="CA">Canada (CA)</MenuItem>
                    <MenuItem value="DE">Germany (DE)</MenuItem>
                    <MenuItem value="MX">Mexico (MX)</MenuItem>
                    <MenuItem value="CN">China (CN)</MenuItem>
                    <MenuItem value="VN">Vietnam (VN)</MenuItem>
                    <MenuItem value="IN">India (IN)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Primary Export Port (optional)"
                    size="small"
                    value={form.exportPort}
                    sx={inputSx}
                    onChange={(e) => setField("exportPort", e.target.value)}
                    placeholder="e.g., Yantian, Rotterdam, Lázaro Cárdenas"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Invoicing Currency"
                    size="small"
                    value={form.invoicingCurrency}
                    sx={inputSx}
                    onChange={(e) => setField("invoicingCurrency", e.target.value)}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="CNY">CNY</MenuItem>
                    <MenuItem value="MXN">MXN</MenuItem>
                    <MenuItem value="JPY">JPY</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Incoterm"
                    size="small"
                    value={form.incoterm}
                    sx={inputSx}
                    onChange={(e) => setField("incoterm", e.target.value)}
                    placeholder="FOB / EXW / DDP"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Payment Terms (days)"
                    size="small"
                    type="number"
                    value={form.paymentTermsDays}
                    sx={inputSx}
                    onChange={(e) =>
                      setField("paymentTermsDays", e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Years in Operation"
                    size="small"
                    type="number"
                    value={form.yearsInOperation}
                    sx={inputSx}
                    onChange={(e) =>
                      setField("yearsInOperation", e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Revenue Band"
                    size="small"
                    value={form.revenueBand}
                    sx={inputSx}
                    onChange={(e) => setField("revenueBand", e.target.value as SupplierInput["revenueBand"])}
                  >
                    <MenuItem value="Unknown">Unknown</MenuItem>
                    <MenuItem value="<$10M">&lt;$10M</MenuItem>
                    <MenuItem value="$10–50M">$10–50M</MenuItem>
                    <MenuItem value="$50–200M">$50–200M</MenuItem>
                    <MenuItem value=">$200M">&gt;$200M</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Commodity-linked Pricing?"
                    size="small"
                    value={form.commodityLinkedPricing ? "yes" : "no"}
                    sx={inputSx}
                    onChange={(e) => setField("commodityLinkedPricing", e.target.value === "yes")}
                  >
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Trade/Compliance Certifications?"
                    size="small"
                    value={form.hasTradeComplianceCerts ? "yes" : "no"}
                    sx={inputSx}
                    onChange={(e) => setField("hasTradeComplianceCerts", e.target.value === "yes")}
                  >
                    <MenuItem value="no">No / Unknown</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Insurance Coverage?"
                    size="small"
                    value={form.hasInsurance ? "yes" : "no"}
                    sx={inputSx}
                    onChange={(e) => setField("hasInsurance", e.target.value === "yes")}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No / Unknown</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography sx={{ fontSize: 15, fontWeight: 700, mt: 1, mb: 2 }}>
                    Operational Performance
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Single-site Manufacturing?"
                    size="small"
                    value={form.singleSite ? "yes" : "no"}
                    sx={inputSx}
                    onChange={(e) => setField("singleSite", e.target.value === "yes")}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No (multi-site)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Backup Facility?"
                    size="small"
                    value={form.backupFacility ? "yes" : "no"}
                    sx={inputSx}
                    onChange={(e) => setField("backupFacility", e.target.value === "yes")}
                  >
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Avg Lead Time (days)"
                    size="small"
                    type="number"
                    value={form.avgLeadTimeDays}
                    sx={inputSx}
                    onChange={(e) =>
                      setField("avgLeadTimeDays", e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="On-time Delivery (%)"
                    size="small"
                    type="number"
                    value={form.onTimeDeliveryPct}
                    sx={inputSx}
                    onChange={(e) =>
                      setField("onTimeDeliveryPct", e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quality Issues (%)"
                    size="small"
                    type="number"
                    value={form.qualityIssuesPct}
                    sx={inputSx}
                    onChange={(e) =>
                      setField("qualityIssuesPct", e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography sx={{ fontSize: 15, fontWeight: 700, mt: 1, mb: 2 }}>
                    Dependency
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Share of Category Volume (%)"
                    size="small"
                    type="number"
                    value={form.categoryVolumeSharePct}
                    sx={inputSx}
                    onChange={(e) =>
                      setField("categoryVolumeSharePct", e.target.value === "" ? "" : Number(e.target.value))
                    }
                    helperText="How much of this category depends on this supplier?"
                  />
                </Grid>
              </Grid><Box
  sx={{
    mt: 4,
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
  }}
>
  <Button
    variant="outlined"
    size="medium"
    sx={{ borderRadius: "10px", textTransform: "none" }}
  >
    Save Draft
  </Button>
<Button
  variant="contained"
  size="medium"
  sx={{
    borderRadius: "10px",
    textTransform: "none",
    px: 3,
    fontWeight: 600,
    backgroundColor: "#1e3a8a",
    "&:hover": { backgroundColor: "#1e40af" },
  }}
  onClick={() => {
    navigate("/SupplierRiskProfile", {
      state: { formData: form },
    });
  }}
>
  Start Screening
</Button>
</Box>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
}