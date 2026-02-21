import React from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
  Grid
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type AdditionalDuty = {
  label: string;
  rate?: number | null;
};

type TariffExposureSnapshotProps = {
  hsCode?: string;
  description?: string;

  mfnRate?: number | null;
  appliedProgram?: string;

  additionalDuties?: AdditionalDuty[];

  totalEffectiveRate?: number | null;

  showWarning?: boolean;
  warningText?: string;

  landedCost?: number | null;
};

export default function TariffExposureSnapshot({
  hsCode = "--",
  description,
  mfnRate,
  appliedProgram = "MFN",
  additionalDuties = [],
  totalEffectiveRate,
  showWarning = false,
  warningText = "Trade overlay applied",
  landedCost,
}: TariffExposureSnapshotProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        width: "90%",
        borderRadius: 2.5,
        border: "1px solid #E2E8F0",
        background: "#FFFFFF",
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
      }}
    >
      {/* Header */}
      <Stack spacing={0.2} mb={1.5}>
        <Typography
          variant="caption"
          sx={{ letterSpacing: "0.08em", color: "#64748B", fontWeight: 600 }}
        >
          TARIFF EXPOSURE SNAPSHOT
        </Typography>
      </Stack>

      <Grid container spacing={3} alignItems="center">
        {/* HS Info */}
        <Grid item xs={3}>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            HS CODE
          </Typography>
          <Typography fontWeight={600}>
            {hsCode}
          </Typography>

          {description && (
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              {description}
            </Typography>
          )}
        </Grid>

        {/* MFN */}
        <Grid item xs={2}>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            MFN
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={600}>
              {mfnRate != null ? `${mfnRate.toFixed(2)}%` : "--"}
            </Typography>

            <Chip
              label={appliedProgram}
              size="small"
              sx={{
                backgroundColor: "#EEF2FF",
                color: "#1E3A8A",
                fontSize: "0.7rem",
                height: 20,
              }}
            />
          </Stack>
        </Grid>

        {/* Additional */}
        <Grid item xs={3}>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            ADDITIONAL
          </Typography>

          <Stack spacing={0.5}>
            {additionalDuties.length === 0 && (
              <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                —
              </Typography>
            )}

            {additionalDuties.map((duty, index) => (
              <Stack
                key={index}
                direction="row"
                justifyContent="space-between"
              >
                <Typography variant="caption">
                  {duty.label}
                </Typography>

                <Typography fontWeight={600}>
                  {duty.rate != null
                    ? `${duty.rate.toFixed(2)}%`
                    : "—"}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>

        {/* Total */}
        <Grid item xs={4}>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            TOTAL EFFECTIVE RATE
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: "#1E3A8A" }}
          >
            {totalEffectiveRate != null
              ? `${totalEffectiveRate.toFixed(2)}%`
              : "--"}
          </Typography>

          {landedCost != null && (
            <Typography
              variant="caption"
              sx={{ color: "#64748B", display: "block", mt: 0.5 }}
            >
              Landed Cost: ${landedCost.toLocaleString()}
            </Typography>
          )}

          {showWarning && (
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <WarningAmberRoundedIcon
                sx={{ color: "#F59E0B", fontSize: 16 }}
              />
              <Typography variant="caption" sx={{ color: "#92400E" }}>
                {warningText}
              </Typography>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}