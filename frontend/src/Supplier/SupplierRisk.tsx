// SupplierRiskProfile.tsx
// Supplier Risk Intelligence + Governance View
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  Button,
  TextField,
  Stack,
} from "@mui/material";

const supplier = {
  name: "Shenzhen Advanced Components Ltd.",
  country: "China",
  currency: "CNY",
  primaryPort: "Yantian (CN)",
  incoterm: "FOB",
  volumeDependency: "32% of total category volume",
};

const riskScores = {
  market: 72,
  policy: 65,
  operational: 40,
  counterparty: 55,
};

const overallRisk = 63; // Demo score

const getRiskLevel = (score: number) => {
  if (score >= 70) return { label: "High", color: "error" as const };
  if (score >= 50) return { label: "Moderate", color: "warning" as const };
  return { label: "Low", color: "success" as const };
};

const getWorkflowStatus = (score: number) => {
  if (score >= 70) return "Escalation Required";
  if (score >= 50) return "Review Required";
  return "Approved";
};

const RiskCard = ({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description: string;
}) => {
  const level = getRiskLevel(score);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
      }}
    >
      <Typography fontWeight={600} mb={1}>
        {title}
      </Typography>

      <Box display="flex" alignItems="center" mb={1}>
        <Box flex={1} mr={2}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Box>
        <Typography fontWeight={600}>{score}</Typography>
      </Box>

      <Chip
        label={level.label}
        color={level.color}
        size="small"
        sx={{ mb: 1 }}
      />

      <Typography fontSize={13} color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
};

export default function SupplierRiskProfile() {
 
  const [decision, setDecision] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
 const navigate = useNavigate();
  const level = getRiskLevel(overallRisk);
  const workflowStatus = getWorkflowStatus(overallRisk);

  return (
    <Box sx={{ maxWidth: 1300, mx: "auto", mt: 6, mb: 8, px: 3 }}>
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
<Stack
  direction="row"
  justifyContent="space-between"
  alignItems="flex-start"
  mb={3}
>
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
      LIVE RISK MONITORING PANEL
    </Typography>

    <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>
      {supplier.name}
    </Typography>

    <Typography fontSize={14} color="#475569">
      Country: {supplier.country} | Currency: {supplier.currency} | Port:{" "}
      {supplier.primaryPort} | Incoterm: {supplier.incoterm}
    </Typography>
  </Box>

  <Button
    variant="contained"
    sx={{
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 600,
      backgroundColor: "#0f172a",
      "&:hover": { backgroundColor: "#1e293b" },
    }}
    onClick={() => navigate("/SupplierRiskInsights")}
  >
    Advanced Analytics
  </Button>
</Stack>

        {/* Overall Risk */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 5,
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography fontWeight={600} mb={2}>
            Overall Supplier Risk Score
          </Typography>

          <Box display="flex" alignItems="center">
            <Box flex={1} mr={2}>
              <LinearProgress
                variant="determinate"
                value={overallRisk}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography fontSize={22} fontWeight={700}>
              {overallRisk}
            </Typography>
          </Box>

          <Typography mt={2} fontSize={14} color="#475569">
            Volume Dependency: {supplier.volumeDependency}
          </Typography>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* Risk Breakdown */}
        <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
          Risk Breakdown
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Market Exposure"
              score={riskScores.market}
              description="FX volatility, commodity linkage, freight sensitivity."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Policy Exposure"
              score={riskScores.policy}
              description="Tariff risk, sanctions exposure, trade dispute sensitivity."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Operational Risk"
              score={riskScores.operational}
              description="Port congestion, infrastructure reliability, delay history."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Counterparty Risk"
              score={riskScores.counterparty}
              description="Financial stability, credit profile, default exposure."
            />
          </Grid>
        </Grid>

        {/* Governance Section */}
        {workflowStatus !== "Approved" && (
          <>
            <Divider sx={{ my: 5 }} />

            <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
              Review & Decision
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter review notes or mitigation plan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                onClick={() => setDecision("Approved")}
              >
                Approve
              </Button>

              <Button
                variant="outlined"
                onClick={() => setDecision("Approved with Conditions")}
              >
                Approve with Conditions
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => setDecision("Escalated")}
              >
                Escalate
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => setDecision("Rejected")}
              >
                Reject
              </Button>
            </Stack>

            {decision && (
              <Typography mt={3} fontWeight={600}>
                Decision Recorded: {decision}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}