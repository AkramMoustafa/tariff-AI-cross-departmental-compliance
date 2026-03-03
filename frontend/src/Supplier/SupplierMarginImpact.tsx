// SupplierMarginImpact.tsx

import React from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
} from "@mui/material";

export default function SupplierMarginImpact() {
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={4}>
        Supplier Risk Impact on Margin
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography fontWeight={600}>
          Shenzhen Advanced Components Ltd.
        </Typography>

        <Typography mt={3}>Expected Margin: 18%</Typography>
        <Typography>10th Percentile Margin: 12%</Typography>
        <Typography>Probability Margin &lt; 10%: 8%</Typography>

        <Typography mt={4} fontWeight={600}>
          Downside Exposure
        </Typography>

        <LinearProgress
          variant="determinate"
          value={80}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Paper>
    </Box>
  );
}