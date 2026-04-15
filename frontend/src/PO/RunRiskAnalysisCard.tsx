import React, { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { predictPO } from "@/api/po";

type Props = {
  onRun?: () => void;
};

export default function RunRiskAnalysisCard({ onRun }: Props) {
  const [loading, setLoading] = useState(false);

const handleClick = async () => {
  setLoading(true);

  if (onRun) {
    await onRun();   // ✅ REAL async call
  }

  setLoading(false);
};

  return (
    <Box
      sx={{
        p: 4,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 3,
        mb: 5,
      }}
    >
      {/* LEFT SIDE */}
      <Box>
        <Typography fontWeight={600} mb={0.5}>
          Run Risk Analysis
        </Typography>

        <Typography fontSize={13} color="#64748b">
          Analyze this purchase order to predict delays, financial exposure, and recommended mitigation actions.
        </Typography>
      </Box>

      {/* BUTTON */}
      <Button
        variant="contained"
        onClick={handleClick}
        disabled={loading}
        sx={{
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          px: 4,
          py: 1.2,
          fontSize: 14,
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          display: "flex",
          alignItems: "center",
          gap: 1,
          "&:hover": {
            background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
          },
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={18} sx={{ color: "white" }} />
            Analyzing Trade Risk...
          </>
        ) : (
          "Run Risk Analysis"
        )}
      </Button>
    </Box>
  );
}