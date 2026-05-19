import React, { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";


type Props = {
  onRun?: () => void;
  buttonSx?: object;
};

export default function RunRiskAnalysisCard({ onRun, buttonSx }: Props) {
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
        p: 3,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        mb: 2,
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
        onClick={handleClick}
        disabled={loading}
        sx={{
          ...buttonSx,
          display: "flex",
          alignItems: "center",
          gap: 1,
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