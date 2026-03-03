// SourcingMixOptimizer.tsx

import React from "react";
import { Box, Typography, Paper, Slider } from "@mui/material";

export default function SourcingMixOptimizer() {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={4}>
        Sourcing Mix Simulation
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography gutterBottom>
          Allocate volume between Supplier A and Supplier B
        </Typography>

        <Slider
          defaultValue={60}
          valueLabelDisplay="on"
        />

        <Typography mt={4} fontWeight={600}>
          Simulated Results (Static)
        </Typography>

        <Typography>Expected Margin: 18.6%</Typography>
        <Typography>10th Percentile Margin: 13.2%</Typography>
        <Typography>Probability Margin &lt; 10%: 5.3%</Typography>
      </Paper>
    </Box>
  );
}