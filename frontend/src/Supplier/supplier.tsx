import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
} from "@mui/material";

import { getSupplier } from "../api/SupplierIntelligence";

export default function SupplierProfile() {
  const { supplierId } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<any>(null);

  useEffect(() => {
    async function loadSupplier() {
      if (!supplierId) return;

      try {
        const supplierData = await getSupplier(Number(supplierId));
        setSupplier(supplierData);
      } catch (err) {
        console.error("Failed to load supplier profile", err);
      }
    }

    loadSupplier();
  }, [supplierId]);

  if (!supplier) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography>Loading supplier profile...</Typography>
      </Box>
    );
  }

  const profile = supplier.profile || {};

const goToRiskProfile = () => {
  navigate(`/SupplierRiskProfile/${supplier.id}`);
};

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6, mb: 8, px: 3 }}>
      <Paper
        elevation={0}
        onClick={goToRiskProfile}
        sx={{
          background: "#ffffff",
          borderRadius: "20px",
          p: 5,
          border: "1px solid #e5e7eb",
          boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 16px 50px rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* Header */}
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Supplier Profile
        </Typography>

        <Typography sx={{ fontSize: 26, fontWeight: 700, mt: 1 }}>
          {supplier.name}
        </Typography>

        <Stack direction="row" spacing={2} mt={2}>
          <Chip label={`Country: ${supplier.country}`} />
          <Chip
            label={`Manufacturing: ${
              profile.manufacturing_country || "Unknown"
            }`}
          />
          <Chip label={`Incoterm: ${profile.incoterm || "Unknown"}`} />
        </Stack>

        {/* Profile Details */}
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mt: 5,
            mb: 2,
          }}
        >
          Supplier Details
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography fontWeight={600}>Country Incorporation</Typography>
              <Typography>
                {profile.country_incorporation || "Unknown"}
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight={600}>Export Port</Typography>
              <Typography>{profile.export_port || "Unknown"}</Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight={600}>Invoicing Currency</Typography>
              <Typography>
                {profile.invoicing_currency || "Unknown"}
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight={600}>Payment Terms</Typography>
              <Typography>
                {profile.payment_terms_days
                  ? `${profile.payment_terms_days} days`
                  : "Unknown"}
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight={600}>Years in Operation</Typography>
              <Typography>
                {profile.years_in_operation || "Unknown"}
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography fontWeight={600}>Revenue Band</Typography>
              <Typography>{profile.revenue_band || "Unknown"}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Paper>
    </Box>
  );
}