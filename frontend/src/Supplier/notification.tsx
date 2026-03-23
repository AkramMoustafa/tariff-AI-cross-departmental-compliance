import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
} from "@mui/material";

const alerts = [
  {
    supplier: "Linamar Corporation",
    severity: "HIGH",
    title: "Potential Supply Disruption Detected",
    description:
      "Factory activity decline and increased port congestion indicate possible shipment delays.",
    drivers: [
      "Port congestion increased by 22%",
      "Hiring slowdown detected",
      "Country risk elevated",
    ],
    timestamp: "2 hours ago",
  },
  {
    supplier: "Bavaria Precision GmbH",
    severity: "MEDIUM",
    title: "Operational Slowdown Signal",
    description:
      "Reduced logistics movement suggests lower operational throughput.",
    drivers: [
      "Lower vessel movement near export port",
      "Stable but declining hiring activity",
    ],
    timestamp: "Yesterday",
  },
];

const getSeverityColor = (severity: string) => {
  if (severity === "HIGH") return "error";
  if (severity === "MEDIUM") return "warning";
  return "success";
};

export default function SupplierAlerts() {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6, px: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        🚨 Supply Chain Disruption Alerts
      </Typography>

      <Stack spacing={3}>
        {alerts.map((alert, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography fontWeight={700}>
                {alert.supplier}
              </Typography>

              <Chip
                label={alert.severity}
                color={getSeverityColor(alert.severity)}
                size="small"
              />
            </Stack>

            {/* Title */}
            <Typography fontWeight={600} mb={1}>
              {alert.title}
            </Typography>

            {/* Description */}
            <Typography fontSize={14} color="text.secondary" mb={2}>
              {alert.description}
            </Typography>

            {/* Drivers */}
            <Box mb={2}>
              <Typography fontSize={13} fontWeight={600} mb={1}>
                Key Risk Drivers
              </Typography>

              {alert.drivers.map((driver, i) => (
                <Typography key={i} fontSize={13} color="text.secondary">
                  • {driver}
                </Typography>
              ))}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Footer */}
            <Typography fontSize={12} color="text.secondary">
              Detected: {alert.timestamp}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}