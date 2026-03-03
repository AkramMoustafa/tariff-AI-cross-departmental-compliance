// TradeOptimization.tsx
// AI-Optimized Purchase Order Comparison Layer (Static Demo)

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Stack,
  Chip,
  Button,
} from "@mui/material";

const sectionCard = {
  p: 4,
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
};

const metricCard = {
  p: 3,
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f8fafc",
};

export default function TradeOptimization() {
  const [decision, setDecision] = useState<string | null>(null);

  // -----------------------------
  // Static Original PO
  // -----------------------------
  const original = {
    incoterm: "FOB",
    supplier: "Shenzhen Advanced Components Ltd.",
    currency: "CNY",
    volumeShare: 32,
    riskScore: 63,
    overrunProbability: 37,
    stressedMargin: 28.4,
    tariffExposure: 8,
  };

  // -----------------------------
  // Static Optimized PO (AI Proposed)
  // -----------------------------
  const optimized = {
    incoterm: "DDP",
    supplier: "Split: 70% Shenzhen / 30% Mexico Alternative",
    currency: "USD",
    volumeShare: 24,
    riskScore: 47,
    overrunProbability: 18,
    stressedMargin: 33.1,
    tariffExposure: 4,
  };

  const riskReduction = original.riskScore - optimized.riskScore;
  const marginImprovement =
    optimized.stressedMargin - original.stressedMargin;
  const overrunReduction =
    original.overrunProbability - optimized.overrunProbability;

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
          AI Optimization Engine
        </Typography>

        <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 4 }}>
          Purchase Order Optimization Proposal
        </Typography>

        {/* Risk Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 5,
            borderRadius: "16px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #10b981",
          }}
        >
          <Typography fontWeight={800} color="#065f46">
            Risk Reduced by {riskReduction} Points
          </Typography>
          <Typography fontSize={14} color="#065f46">
            AI optimization improves stability and reduces exposure.
          </Typography>
        </Paper>

        {/* -------------------------------- */}
        {/* Explanation Section */}
        {/* -------------------------------- */}

        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography fontSize={18} fontWeight={800} mb={3}>
            What Changed & Why
          </Typography>

          <Stack spacing={2}>
            <Typography>
              <strong>Incoterm: FOB → DDP</strong> — Shifts logistics
              volatility and customs variability to supplier, reducing
              operational risk exposure.
            </Typography>

            <Typography>
              <strong>Currency: CNY → USD</strong> — Eliminates direct FX
              volatility and improves margin predictability.
            </Typography>

            <Typography>
              <strong>Supplier Concentration: 32% → 24%</strong> —
              Introduces partial dual sourcing to reduce concentration risk.
            </Typography>

            <Typography>
              <strong>Tariff Exposure: 8% → 4%</strong> — Regional
              diversification lowers policy shock sensitivity.
            </Typography>
          </Stack>
        </Paper>

        {/* -------------------------------- */}
        {/* Comparison Grid */}
        {/* -------------------------------- */}

        <Grid container spacing={4}>
          {/* Original */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ ...sectionCard }}>
              <Typography fontSize={18} fontWeight={700} mb={3}>
                Original PO
              </Typography>

              <Stack spacing={2}>
                {Object.entries(original).map(([key, value]) => (
                  <Box key={key} sx={metricCard}>
                    <Typography fontSize={13} color="#64748b">
                      {key}
                    </Typography>
                    <Typography fontWeight={700}>
                      {typeof value === "number" ? `${value}` : value}
                      {key.includes("Probability") ||
                      key.includes("Exposure") ||
                      key.includes("Share")
                        ? "%"
                        : ""}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Optimized */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                ...sectionCard,
                border: "1px solid #10b981",
                backgroundColor: "#f0fdf4",
              }}
            >
              <Typography fontSize={18} fontWeight={700} mb={3}>
                AI-Optimized PO
              </Typography>

              <Stack spacing={2}>
                {Object.entries(optimized).map(([key, value]) => (
                  <Box key={key} sx={metricCard}>
                    <Typography fontSize={13} color="#64748b">
                      {key}
                    </Typography>
                    <Typography fontWeight={700}>
                      {typeof value === "number" ? `${value}` : value}
                      {key.includes("Probability") ||
                      key.includes("Exposure") ||
                      key.includes("Share")
                        ? "%"
                        : ""}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* -------------------------------- */}
        {/* Quantified Impact */}
        {/* -------------------------------- */}

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mt: 6,
            borderRadius: "16px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography fontSize={18} fontWeight={800} mb={3}>
            Quantified Impact
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#64748b">
                Margin Improvement
              </Typography>
              <Typography fontSize={22} fontWeight={800}>
                +{marginImprovement.toFixed(1)}pp
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#64748b">
                Budget Overrun Reduction
              </Typography>
              <Typography fontSize={22} fontWeight={800}>
                -{overrunReduction}%
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#64748b">
                Risk Reduction
              </Typography>
              <Typography fontSize={22} fontWeight={800}>
                -{riskReduction} points
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 6 }} />

        {/* -------------------------------- */}
        {/* Decision Controls */}
        {/* -------------------------------- */}

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            onClick={() => setDecision("Kept Original")}
          >
            Keep Original
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() =>
              setDecision("Accepted Optimized Version")
            }
          >
            Accept Optimized Version
          </Button>

          <Button
            variant="outlined"
            color="warning"
            onClick={() => setDecision("Escalated for Review")}
          >
            Escalate
          </Button>
        </Stack>

        {decision && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography fontWeight={700}>
              Decision Recorded: {decision}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}