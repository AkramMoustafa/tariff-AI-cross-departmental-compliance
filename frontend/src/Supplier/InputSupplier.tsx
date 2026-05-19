// SupplierIntake.tsx
// Procurement-entered supplier profile → system-derived risk scores (static/rule-based).
// Uses MUI only. Drop into your app and route to it from PrePOIntake.
import { createSupplier } from "../api/SupplierIntelligence";
import { Box,Paper,Typography, TextField, Grid, Button} from "@mui/material";
import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom";
const country_currency = {
  AE: "AED",AL: "ALL",AR: "ARS",AU: "AUD",BD: "BDT",BG: "BGN",BH: "BHD",BO: "BOB",BR: "BRL",CA: "CAD",CH: "CHF",CL: "CLP",CN: "CNY",CO: "COP",
  CZ: "CZK",
  EG: "EGP",
  ET: "ETB",
  EU: "EUR",
  GB: "GBP",
  HK: "HKD",
  HU: "HUF",
  ID: "IDR",
  IN: "INR",
  IS: "ISK",
  JM: "JMD",
  JP: "JPY",
  KE: "KES",
  KH: "KHR",
  KR: "KRW",
  KW: "KWD",
  KZ: "KZT",
  LA: "LAK",
  LK: "LKR",
  MA: "MAD",
  MM: "MMK",
  MN: "MNT",
  MX: "MXN",
  MY: "MYR",
  NG: "NGN",
  NO: "NOK",
  NZ: "NZD",
  OM: "OMR",
  PE: "PEN",
  PH: "PHP",
  PL: "PLN",
  PY: "PYG",
  QA: "QAR",
  RO: "RON",
  RU: "RUB",
  SA: "SAR",
  SG: "SGD",
  TH: "THB",
  TR: "TRY",
  TT: "TTD",
  TW: "TWD",
  TZ: "TZS",
  UA: "UAH",
  UG: "UGX",
  VN: "VND",
  ZA: "ZAR",
};
const MATERIAL_CATEGORIES = [
  "Machinery",
  "Electronics",
  "Raw Materials",
  "Components",
  "Textiles",
  "Food & Agriculture"
];

type SupplierInput = {
  legalName: string;
  countryIncorporation: string;
  manufacturingCountry: string;
  exportPort?: string;
  invoicingCurrency: string;
  materialCategory: string;
   products: string[];   
};


const countryOptions = Object.keys(country_currency);


const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    fontSize: 14,
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#1e3a8a", borderWidth: 1.5 },
  },
};

const sectionCard = {
  p: 4,
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
};



export default function SupplierIntake() {

  const navigate = useNavigate();
  
const [form, setForm] = useState<SupplierInput>({
  legalName: "",
  countryIncorporation: "US",
  manufacturingCountry: "CN",
  exportPort: "",
  invoicingCurrency: "USD",
  materialCategory: "",
  products: [],   // ✅ ADD THIS
});

  const updateCountry = (field: "countryIncorporation" | "manufacturingCountry", country: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: country,
      invoicingCurrency: country_currency[country] || "USD",
    }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 6, mb: 8, px: 3 }}>
      <Box
        sx={{
          background: "#ffffff",
          borderRadius: "20px",
          p: 5,
          border: "1px solid #e5e7eb",
          boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
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
            mb: 1,
          }}
        >
          Supplier Intake
        </Typography>

        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0f172a", mb: 1 }}>
          Create Supplier Profile (Procurement Entered)
        </Typography>

        <Typography sx={{ fontSize: 14, color: "#475569", mb: 4 }}>
          Enter structured supplier facts. The system derives risk categories and an overall risk score for downstream
          landed cost / margin modeling.
        </Typography>

        <Grid container spacing={3}>
          {/* Left: Inputs */}
          <Grid item xs={12} md={12}>
            <Paper elevation={0} sx={{ ...sectionCard }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>
                Supplier Facts
              </Typography>

              <Grid container spacing={3}>


                <Grid item xs={12} md={6}>
                <Autocomplete
                  options={countryOptions}
                  value={form.countryIncorporation}
                  autoHighlight
                  openOnFocus
                  onChange={(event, newValue) => {
                    if (newValue) updateCountry("countryIncorporation", newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country of Incorporation"
                      size="small"
                      sx={inputSx}
                    />
                  )}
                />
                </Grid>
<Grid item xs={12}>
  <TextField
    label="Supplier Legal Name"
    fullWidth
    size="small"
    sx={inputSx}
    value={form.legalName}
    onChange={(e) =>
      setForm({ ...form, legalName: e.target.value })
    }
  />
</Grid>

<Grid item xs={12}>
<Autocomplete
  options={MATERIAL_CATEGORIES}
  value={form.materialCategory}
  onChange={(event, newValue) => {
    setForm({ ...form, materialCategory: newValue || "" });
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Material Category"
      size="small"
      sx={inputSx}
    />
  )}
/>
</Grid>

                <Grid item xs={12} md={6}>
                <Autocomplete
                  options={countryOptions}
                  value={form.manufacturingCountry}
                  autoHighlight
                  openOnFocus
                  onChange={(event, newValue) => {
                    if (newValue) updateCountry("manufacturingCountry", newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Primary Manufacturing Country"
                      size="small"
                      sx={inputSx}
                    />
                  )}
                />
                </Grid>
             </Grid>



<Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                size="medium"
                sx={{ borderRadius: "10px", textTransform: "none" }}
              >
                Save Draft
              </Button>
            <Button
              variant="contained"
              size="medium"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                px: 3,
                fontWeight: 600,
                backgroundColor: "#1e3a8a",
                "&:hover": { backgroundColor: "#1e40af" },
              }}
              onClick={async () => {
                try {
const payload = {
  legalName: form.legalName,
  countryIncorporation: form.countryIncorporation,
  manufacturingCountry: form.manufacturingCountry,
  invoicingCurrency: form.invoicingCurrency,
  materialCategory: form.materialCategory,
  products: [] // temporary (or real later)
};
                  // 1️⃣ create supplier
                  const result = await createSupplier(payload);

                  const supplierId = result.supplier_id;


                  
                navigate("/suppliers")
                } catch (error) {
                  console.error("Failed to create supplier or load commodities", error);
                }
              }}
            >
              Save Supplier Screening
            </Button>
            </Box>
                        </Paper>
                      </Grid>

                    </Grid>
                  </Box>
                </Box>
              );
            }