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
import {
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { COUNTRIES } from "@/constants/countries";
import { Autocomplete, TextField } from "@mui/material";


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
  
originCountry?: string;
onOriginChange?: (value: string) => void;
  onExplainClick?: () => void;
  onFindTariff?: (hsCode: string) => void;
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
originCountry,
onOriginChange,
  onExplainClick,
  onFindTariff,
}: TariffExposureSnapshotProps){  return (
    <Paper
      elevation={0}
 sx={{
    mt: 3,
    mb: 4,   
    p: 4,
    width: "100%",
    borderRadius: 3,
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    transition: "all 0.25s ease",
    "&:hover": {
      boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
    },
      }}
    >
      {/* Header */}
      
<Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  mb={3}
>
  <Box>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "#64748b",
        mb: 0.5,
      }}
    >
      Tariff Snapshot
    </Typography>

    <Typography
      sx={{
        fontSize: 14,
        color: "#475569",
      }}
    >
      Real-time duty exposure for selected product
    </Typography>
  </Box>

  {onExplainClick && (
    <Typography
      onClick={onExplainClick}
      sx={{
        fontSize: 12,
        fontWeight: 600,
        color: "#1e3a8a",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": {
          opacity: 0.7,
        },
      }}
    >
      View Legal Breakdown →
    </Typography>
  )}
</Stack>
      <Grid container spacing={3} alignItems="center">
        {/* HS Info */}
        <Grid item xs={12} md={3}>
            {onFindTariff && hsCode !== "--" && (
                <Typography
                    variant="caption"
                    sx={{
                    display: "block",
                    mt: 0.5,
                    cursor: "pointer",
                    color: "#1E3A8A",
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => onFindTariff(hsCode)}
                >
                    Find Tariffs for This Product
                </Typography>
                )}
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            HS CODE
          </Typography>
<Autocomplete
  size="small"
  options={COUNTRIES}
  getOptionLabel={(option) => `${option.name} (${option.code})`}
  value={COUNTRIES.find((c) => c.code === originCountry) || null}
  onChange={(_, newValue) => {
    if (newValue) {
      onOriginChange?.(newValue.code);
    }
  }}
  ListboxProps={{
    sx: {
      maxHeight: 160,
      borderRadius: 2,
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    },
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Select origin"
      sx={{
        mt: 1,
        "& .MuiOutlinedInput-root": {
          height: 36,
          fontSize: 13,
          borderRadius: 2,
          backgroundColor: "#f8fafc",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#eef2ff",
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#e5e7eb",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#1e3a8a",
        },
      }}
    />
  )}
/>
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
    <Grid item xs={12} md={4}>
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
       <Grid item xs={12} md={3}>
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
       <Grid item xs={12} md={4}>
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