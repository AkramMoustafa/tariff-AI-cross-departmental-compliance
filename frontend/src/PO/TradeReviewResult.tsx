import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  LinearProgress,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
const sectionCard = {
  p: 4,
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
};

const riskLevel = (score: number) => {
  if (score >= 70) return { label: "High", color: "error" as const };
  if (score >= 50) return { label: "Moderate", color: "warning" as const };
  return { label: "Low", color: "success" as const };
};

export default function TradeReviewResult() {
  // -----------------------------
  // Static Mock Data
  // -----------------------------

  const totalValue = 2_760_000;
  const tariffRate = 8;
  const tariffImpact = 220_800;

  const supplierRiskScore = 63;
  const monteCarlo = {
    mean: 2_640_000,
    p90: 2_780_000,
    probabilityExceed: 37,
  };

  const decision = "Conditional Approval";

  const risk = riskLevel(supplierRiskScore);
  const navigate = useNavigate();
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
          Trade Review Result
        </Typography>

        <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 4 }}>
          Purchase Order Intelligence Summary
        </Typography>

        {/* Governance Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 5,
            borderRadius: "16px",
            backgroundColor: "#fef3c7",
            border: "1px solid #fcd34d",
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Box>
              <Typography fontWeight={700}>
                Governance Decision
              </Typography>
              <Typography fontSize={14}>
                Action Required: Finance Review
              </Typography>
            </Box>

            <Chip
              label={decision}
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Paper>

        {/* Order Summary */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography fontSize={18} fontWeight={600} mb={3}>
            Order Summary
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography fontSize={13} color="#64748b">
                Total Order Value
              </Typography>
              <Typography fontWeight={600}>
                ${totalValue.toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={13} color="#64748b">
                Origin
              </Typography>
              <Typography fontWeight={600}>China (CN)</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={13} color="#64748b">
                Destination
              </Typography>
              <Typography fontWeight={600}>United States (US)</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tariff Exposure */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography fontSize={18} fontWeight={600} mb={3}>
            Tariff Exposure
          </Typography>

          <Typography>
            Estimated Tariff Rate: <strong>{tariffRate}%</strong>
          </Typography>

          <Typography>
            Estimated Tariff Impact:{" "}
            <strong>${tariffImpact.toLocaleString()}</strong>
          </Typography>
        </Paper>

        {/* Supplier Risk */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography fontSize={18} fontWeight={600} mb={3}>
            Supplier Risk Snapshot
          </Typography>

          <Box display="flex" alignItems="center" mb={2}>
            <Box flex={1} mr={2}>
              <LinearProgress
                variant="determinate"
                value={supplierRiskScore}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography fontWeight={600}>
              {supplierRiskScore}
            </Typography>
          </Box>

          <Chip label={risk.label} color={risk.color} />
        </Paper>

        {/* Monte Carlo Outputs */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography fontSize={18} fontWeight={600} mb={3}>
            Cost Simulation (Monte Carlo)
          </Typography>

          <Typography>
            Expected Landed Cost:{" "}
            <strong>${monteCarlo.mean.toLocaleString()}</strong>
          </Typography>

          <Typography>
            P90 Landed Cost:{" "}
            <strong>${monteCarlo.p90.toLocaleString()}</strong>
          </Typography>

          <Typography>
            Probability of Budget Exceed:{" "}
            <strong>{monteCarlo.probabilityExceed}%</strong>
          </Typography>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* Advanced Analytics Button */}
        <Box textAlign="right">
          <Button
            variant="contained"
            onClick={() => navigate("/SupplierPortfolioAnalysis")}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              backgroundColor: "#1e3a8a",
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            View Advanced Analytics
          </Button>
        </Box>
      </Box>
    </Box>
  );
}