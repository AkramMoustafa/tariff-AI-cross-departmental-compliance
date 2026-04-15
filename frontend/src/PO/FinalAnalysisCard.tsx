import React, { useState } from "react";
import { Box, Typography, Chip, Grid } from "@mui/material";
type Props = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  delay: number;
  exposure: number;
  action: string;
};

export default function FinalAnalysisCard({
  riskLevel,
  delay,
  exposure,
  action,
}: Props){
  const riskColor =
    riskLevel === "HIGH"
      ? "#dc2626"
      : riskLevel === "MEDIUM"
      ? "#d97706"
      : "#16a34a";

  return (
    <Box
      sx={{
        p: 4,
        width: "100%", 
        borderRadius: "16px",
        mx: "auto",    
        maxWidth: "1200px", 
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        mb: 5,
      }}
    >
      {/* Header */}
      <Typography fontWeight={600} mb={2}>
        AI Risk Analysis
      </Typography>

      {/* Top Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Typography fontSize={12} color="#64748b">
            Risk Level
          </Typography>
          <Chip
            label={riskLevel}
            sx={{
              mt: 1,
              fontWeight: 600,
              backgroundColor: `${riskColor}15`,
              color: riskColor,
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography fontSize={12} color="#64748b">
            Predicted Delay
          </Typography>
          <Typography fontWeight={600} mt={1}>
            {delay} days
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography fontSize={12} color="#64748b">
            Financial Exposure
          </Typography>
          <Typography fontWeight={600} mt={1}>
            ${exposure.toLocaleString()}
          </Typography>
        </Grid>
      </Grid>

      {/* Recommendation */}
      <Box
        sx={{
          p: 3,
          borderRadius: "12px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <Typography fontSize={12} color="#64748b" mb={1}>
          Recommended Action
        </Typography>

        <Typography fontWeight={600}>
          → {action}
        </Typography>
      </Box>
    </Box>
  );
}