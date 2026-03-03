// SupplierRiskDirectory.tsx

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const suppliers = [
  {
    name: "Shenzhen Advanced Components Ltd.",
    country: "China",
    overall: 63,
    market: 72,
    policy: 65,
    operational: 40,
    counterparty: 55,
  },
  {
    name: "Bavaria Precision GmbH",
    country: "Germany",
    overall: 41,
    market: 38,
    policy: 30,
    operational: 45,
    counterparty: 50,
  },
  {
    name: "Monterrey Industrial Parts SA",
    country: "Mexico",
    overall: 52,
    market: 60,
    policy: 35,
    operational: 55,
    counterparty: 48,
  },
];

const getLevel = (score: number) => {
  if (score >= 70) return { label: "High", color: "error" };
  if (score >= 50) return { label: "Moderate", color: "warning" };
  return { label: "Low", color: "success" };
};

export default function SupplierRiskDirectory() {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Supplier Risk Portfolio Overview
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Overall</TableCell>
              <TableCell>Market</TableCell>
              <TableCell>Policy</TableCell>
              <TableCell>Operational</TableCell>
              <TableCell>Counterparty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((s) => {
              const level = getLevel(s.overall);
              return (
                <TableRow key={s.name}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.country}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${s.overall} - ${level.label}`}
                      color={level.color as any}
                    />
                  </TableCell>
                  <TableCell>{s.market}</TableCell>
                  <TableCell>{s.policy}</TableCell>
                  <TableCell>{s.operational}</TableCell>
                  <TableCell>{s.counterparty}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}