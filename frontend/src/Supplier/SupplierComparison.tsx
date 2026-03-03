// SupplierComparison.tsx

import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

const comparison = [
  { metric: "Market Risk", A: "High (72)", B: "Low (38)" },
  { metric: "Policy Risk", A: "Moderate (65)", B: "Low (30)" },
  { metric: "Operational Risk", A: "Low (40)", B: "Moderate (45)" },
  { metric: "Counterparty Risk", A: "Moderate (55)", B: "Moderate (50)" },
  { metric: "Expected Margin", A: "18%", B: "19.2%" },
  { metric: "10th Percentile Margin", A: "12%", B: "14%" },
  { metric: "Probability Margin <10%", A: "8%", B: "4%" },
];

export default function SupplierComparison() {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={4}>
        Supplier Comparison – Decision View
      </Typography>

      <Grid container spacing={3}>
        {comparison.map((row) => (
          <Grid item xs={12} key={row.metric}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight={600}>{row.metric}</Typography>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Supplier A: {row.A}</Typography>
                <Typography>Supplier B: {row.B}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}