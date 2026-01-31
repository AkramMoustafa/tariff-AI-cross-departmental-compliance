import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Chip,
  InputAdornment,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { calculateTariff } from "@/api/tariffClient";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import NextActionsPanel from "./NextActionsPanel"

export default function TariffCalculator() {
  


  const [hsCode, setHsCode] = useState("");
  const [origin, setOrigin] = useState("CN");
  const [destination, setDestination] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [customsValue, setCustomsValue] = useState<number | "">("");
  const [freight, setFreight] = useState(500);
  const [insurance, setInsurance] = useState(50);

  const [result, setResult] = useState<any>(null);
  const mfnLine = result?.lines?.find((l: any) => l.duty_type === "MFN");
  const mpfLine = result?.lines?.find((l: any) => l.duty_type === "MPF");
  const tariffLines = result?.lines ?? [];
  const [loading, setLoading] = useState(false);
const handleCalculate = async () => {
  
    console.log("Submitting tariff calculation:", {
    hsCode,
    origin,
    destination,
    customsValue,
    freight,
    insurance,
    currency,
  });
  
  if (customsValue === "" || customsValue <= 0) {
    alert("Customs value must be greater than 0");
    return;
  }

  setLoading(true);
  try {
    const data = await calculateTariff({
      hs_code: hsCode,
      origin_country: origin,
      destination_country: destination,
      customs_value: customsValue,
      freight,
      insurance,
      currency,
    });
    setResult(data);
  } finally {
    setLoading(false);
  }
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#ffffff",
        p: 4,
      }}
    >
      {/* GRID BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ffffff",
          backgroundImage: `
            linear-gradient(to right, rgba(221, 221, 221, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203,203,203,0.25) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
          
      <Box
        sx={{
          position: "absolute",
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "56rem",
          height: "28rem",
          filter: "blur(90px)",
          borderRadius: "50%",
          opacity: 0.22,
          bgcolor: "rgba(0,0 0, 0, 0.18)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* 🔑 CONTENT LAYER (PUT EVERYTHING HERE) */}

      <Box sx={{ position: "relative", zIndex: 1, marginLeft: "0", maxWidth: "900px"}}>
        {/* 👇 ALL YOUR REAL UI GOES HERE */}

      {/* HEADER META */}
      
<Box sx={{ mb: 2 }}>
  {/* BADGE + VERSION */}
  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
    <Chip
      label="OFFICIAL DATA SOURCE"
      size="small"
      sx={{
        bgcolor: "rgba(16, 52, 166, 0.08)",
        color: "#1034A6",
        fontWeight: 600,
        fontSize: "11px",
        borderRadius: 1,
      }}
    />
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 500 }}
    >
      HTS 2026 v3
    </Typography>
  </Stack>

  {/* TITLE */}
  <Typography variant="h4" fontWeight={600} mb={0.5}>
    HS Code Tariff Calculator
  </Typography>

  <Typography variant="body2" color="text.secondary" fontSize={12} >
    Official tariff calculations based on Harmonized Tariff Schedule (HTS)
    schedules. Enter </Typography>  <Typography variant="body2" fontSize={12} color="text.secondary" marginBottom={3} >
     shipment details below to receive an instant, auditable
    duty estimate and compliance breakdown.
  </Typography>
</Box>
<Grid container spacing={3} alignItems="flex-start" wrap = "nowrap">
  <Grid item xs={12} lg={8} wrap="nowrap">
<Paper
  sx={{
    p: 3,
    borderRadius: 1,
    minHeight: "50vh",
    width: "70vh",
    position: "relative",   
    overflow: "visible",    
     bgcolor: "#ffffff",
  }}
>
  {/* TOP BAR */}
<Box
  sx={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50px",
    bgcolor: "#f9f9f9",
    px: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  {/* LEFT: TITLE */}
  <Box>
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 600,
        color: "#0f172a",
        lineHeight: 1.2,
      }}
    >
      Shipment Parameters
    </Typography>
    <Typography
      sx={{
        fontSize: 11,
        color: "#64748b",
      }}
    >
      Used for duty & tariff calculation
    </Typography>
  </Box>

  {/* RIGHT: CLEAR FORM (UI ONLY) */}
  <Button
    variant="text"
    size="small"
    sx={{
      fontSize: 12,
      fontWeight: 500,
      color: "#64748b",
      textTransform: "none",
      px: 1,
      "&:hover": {
        color: "#0f172a",
        backgroundColor: "rgba(0,0,0,0.04)",
      },
    }}
  >
    Clear form
  </Button>
</Box>

  {/* BOTTOM BAR */}
<Box
  sx={{
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "70px",
  bgcolor: "#fafafa",
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  px: 3,
  zIndex:10,
  }}
>


<Button
  variant="contained"
  onClick={handleCalculate}
  disabled={loading}
  startIcon={
    
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />
    </Box>
  }
  
  sx={{
    bgcolor: "#0f172a",         
    color: "#ffffff",
    borderRadius: 0.75,
    height: 34,
    px: 2.5,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "none",
    "&:hover": {
      bgcolor: "#020617",
      boxShadow: "none",
    },
  }}
>
  {loading ? "Calculating…" : "Calculate"}
</Button>
</Box>

<Box
sx={{
fontFamily: "inter",
position: "relative",
pt: "40px",
pb: "80px",
display: "flex",
flexDirection: "column",
gap: 3, // 👈 ADD THIS
}}
>
{/* HS CODE */}
<Box>
<Box>
  <Typography variant="subtitle2" mb={0.5}>
    HS Code
  </Typography>

<TextField
  fullWidth
  size="small"
  placeholder="Search HS Code (e.g. 850440)"
  value={hsCode}
  onChange={(e) => setHsCode(e.target.value)}
  
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
      </InputAdornment>
    ),
  }}
  sx={{
    bgcolor: "#ffffff",

    "& .MuiOutlinedInput-root": {
      borderRadius: 0.75,
      fontSize: "14px",
      height: 40,
    },

    "& .MuiOutlinedInput-input": {
      py: 1,
    },

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#e5e7eb",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c7cdd4",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#2563eb",
    },
  }}
/>

</Box>

  {/* SEARCH RESULT */}
<Box
  sx={{
    mt: 1.5,
    p: 1.5,
    borderRadius: 1,
    bgcolor: "rgba(37, 99, 235, 0.06)", // soft blue
    border: "1px solid rgba(37, 99, 235, 0.15)",
    display: "flex",
    alignItems: "flex-start",
    gap: 1.25,
  }}
>
  {/* LEFT ICON */}
  <Box
    sx={{
      mt: "2px",
      width: 18,
      height: 18,
      borderRadius: "50%",
      bgcolor: "rgba(37, 99, 235, 0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: "#2563eb",
      }}
    />
  </Box>

  {/* TEXT */}
  <Box>
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 600,
        color: "#1e40af",
        lineHeight: 1.3,
      }}
    >
      Static Converters; Adp Power Supplies
    </Typography>

    <Typography
      sx={{
        fontSize: 12,
        color: "#1e3a8a",
        opacity: 0.8,
      }}
    >
      Heading 8504 · Electrical machinery and equipment
    </Typography>
  </Box>
</Box>
</Box>

<Box
sx={{
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: 2,
}}
>
{/* ORIGIN */}
<Box>
<Typography
sx={{
fontSize: 12,
fontWeight: 500,
color: "#475569",
mb: 0.5,
}}
>
Origin Country
</Typography>


<TextField
  select
  fullWidth
  size="small"
  value={origin}
  onChange={(e) => setOrigin(e.target.value)}

sx={{
"& .MuiOutlinedInput-root": {
height: 34, 
borderRadius: 1.25,
backgroundColor: "#fff",
},
"& .MuiOutlinedInput-input": {
py: 0.75,
},
"& .MuiOutlinedInput-notchedOutline": {
borderColor: "#e2e8f0",
},
"&:hover .MuiOutlinedInput-notchedOutline": {
borderColor: "#cbd5e1",
},
"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
borderColor: "#2563eb",
borderWidth: 1,
},
"& .MuiSelect-icon": {
color: "#94a3b8",
},
}}
>
<MenuItem value="CN">China (CN)</MenuItem>
<MenuItem value="DE">Germany (DE)</MenuItem>
</TextField>
</Box>


{/* DESTINATION */}
<Box>
<Typography
sx={{
fontSize: 12,
fontWeight: 500,
color: "#475569",
mb: 0.5,
}}
>
Destination
</Typography>


<TextField
value={destination}
onChange={(e) => setDestination(e.target.value)}
sx={{
"& .MuiOutlinedInput-root": {
height: 34,
fontSize: 14,
borderRadius: 1.25,
backgroundColor: "#fff",
},
"& .MuiOutlinedInput-input": {
py: 0.75,
},
"& .MuiOutlinedInput-notchedOutline": {
borderColor: "#e2e8f0",
},
"&:hover .MuiOutlinedInput-notchedOutline": {
borderColor: "#cbd5e1",
},
"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
borderColor: "#2563eb",
},
"& .MuiSelect-icon": {
color: "#94a3b8",
},
}}
>
<MenuItem value="US">United States (US)</MenuItem>
<MenuItem value="CA">Canada (CA)</MenuItem>
</TextField>
</Box>
</Box>

<Box
  sx={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 2,
  }}
>
  {/* CURRENCY */}
  <Box>
    
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 500,
        color: "#475569",
        mb: 0.5,
      }}
    >
      Currency
    </Typography>

    <TextField
value={currency}
onChange={(e) => setCurrency(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 30,
          fontSize: 14,
          borderRadius: 1.25,
          backgroundColor: "#fff",
        },
        "& .MuiOutlinedInput-input": {
          py: 0.75,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#e2e8f0",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#cbd5e1",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#2563eb",
        },
        "& .MuiSelect-icon": {
          color: "#94a3b8",
        },
      }}
    >
      <MenuItem value="USD">USD ($)</MenuItem>
      <MenuItem value="EUR">EUR (€)</MenuItem>
    </TextField>
  </Box>

  {/* CUSTOMS VALUE */}
  <Box>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 500,
        color: "#475569",
        mb: 0.5,
      }}
    >
      Customs Value
    </Typography>

<TextField
  value={customsValue}
  onChange={(e) => {
    const v = e.target.value;
    setCustomsValue(v === "" ? "" : Number(v));
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">$</InputAdornment>
    ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 30,
          fontSize: 14,
          borderRadius: 1.25,
          backgroundColor: "#fff",
        },
        "& .MuiOutlinedInput-input": {
          py: 0.75,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#e2e8f0",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#cbd5e1",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#2563eb",
        },
      }}
    />
  </Box>

  {/* FREIGHT */}
  <Box>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 500,
        color: "#475569",
        mb: 0.5,
      }}
    >
      Freight
    </Typography>

    <TextField
value={freight}
onChange={(e) => setFreight(Number(e.target.value))}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">$</InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 30,
          fontSize: 14,
          borderRadius: 1.25,
          backgroundColor: "#fff",
        },
        "& .MuiOutlinedInput-input": {
          py: 0.75,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#e2e8f0",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#cbd5e1",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#2563eb",
        },
      }}
    />
  </Box>

  {/* INSURANCE */}
  <Box>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 500,
        color: "#475569",
        mb: 0.5,
      }}
    >
      Insurance
    </Typography>

    <TextField
value={insurance}
onChange={(e) => setInsurance(Number(e.target.value))}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">$</InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 30,
          fontSize: 14,
          borderRadius: 1.25,
          backgroundColor: "#fff",
        },
        "& .MuiOutlinedInput-input": {
          py: 0.75,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#e2e8f0",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#cbd5e1",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#2563eb",
        },
      }}
    />
  </Box>
    </Box>
</Box>

</Paper>
<Grid container spacing={2} sx={{ mt: 4 }}>
  {/* TOTAL DUTY */}
  <Grid item xs={12} md={6}>
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: "1px solid #e5e7eb",
      }}
    >
      <Typography fontSize={11} color="text.secondary">
        TOTAL DUTY PAYABLE
      </Typography>

      <Typography fontSize={22} fontWeight={700} mt={0.5}>
{result ? `$${result.total_duty.toFixed(2)}` : "--"}
      </Typography>

      <Stack direction="row" spacing={1} mt={1} alignItems="center">
        <Chip
          label="Calculated"
          size="small"
          color="success"
          variant="outlined"
        />
        <Typography fontSize={11} color="text.secondary">
          Updated 2 mins ago
        </Typography>
      </Stack>
    </Paper>
  </Grid>

  {/* EFFECTIVE RATE */}
  <Grid item xs={12} md={6}>
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: "1px solid #e5e7eb",
      }}
    >
      <Typography fontSize={11} color="text.secondary">
        EFFECTIVE RATE
      </Typography>

      <Typography fontSize={22} fontWeight={700} mt={0.5}>
{result ? `${result.effective_rate}%` : "--"}
      </Typography>

      <Chip
        label="Check Section 301"
        size="small"
        color="warning"
        variant="outlined"
        sx={{ mt: 1 }}
      />
    </Paper>
  </Grid>
</Grid>
<Paper
  sx={{
    mt: 3,
    p: 2,
    borderRadius: 1.5,
    border: "1px solid #e5e7eb",
  }}
>
  <Typography fontSize={14} fontWeight={600} mb={2}>
    Applied Tariff Lines
  </Typography>

  <Grid container spacing={1} sx={{ fontSize: 13 }}>
    {/* HEADER */}
    {["Duty Type", "Rate Type", "Rate", "Reference", "Amount"].map((h) => (
      <Grid item xs={2.4} key={h}>
        <Typography fontSize={11} color="text.secondary">
          {h.toUpperCase()}
        </Typography>
      </Grid>
    ))}

    <Divider sx={{ my: 1, width: "100%" }} />

    {/* MFN DUTY */}
    <Grid item xs={2.4}>
      <Typography fontWeight={500}>MFN Duty</Typography>
      <Typography fontSize={11} color="text.secondary">
        Most Favored Nation
      </Typography>
    </Grid>

    <Grid item xs={2.4}>
      <Chip label="Ad Valorem" size="small" />
    </Grid>

<Grid item xs={2.4}>
  {mfnLine ? `${mfnLine.rate}%` : "--"}
</Grid>
    <Grid item xs={2.4}>
      <Typography
        fontSize={12}
        color="primary"
        sx={{ cursor: "pointer" }}
      >
       {mfnLine?.reference ?? "—"}
      </Typography>
    </Grid>

    <Grid item xs={2.4} textAlign="right">
     <Typography fontWeight={600}>
  {mfnLine ? `$${mfnLine.amount.toFixed(2)}` : "--"}
</Typography>
    </Grid>

    <Divider sx={{ my: 1, width: "100%" }} />

    {/* MPF */}
    <Grid item xs={2.4}>
      <Typography>Merchandise Processing Fee</Typography>
    </Grid>

    <Grid item xs={2.4}>
      <Chip label="Fixed / %" size="small" variant="outlined" />
    </Grid>

<Grid item xs={2.4}>
  {mpfLine ? `${mpfLine.rate}%` : "--"}
</Grid>

    <Grid item xs={2.4}>
      <Typography fontSize={12}>19 CFR 24.23</Typography>
    </Grid>

<Grid item xs={2.4} textAlign="right">
  {mpfLine ? `$${mpfLine.amount.toFixed(2)}` : "--"}
</Grid>

    <Divider sx={{ my: 2, width: "100%" }} />

    {/* TOTAL */}
    <Grid item xs={9.6} textAlign="right">
      <Typography fontWeight={600}>Estimated Total</Typography>
    </Grid>

    <Grid item xs={2.4} textAlign="right">
      <Typography fontWeight={700}>
  {result ? `$${result.total_duty.toFixed(2)}` : "--"}
</Typography>
    </Grid>
  </Grid>
</Paper>

          </Grid>

{/* RIGHT COLUMN */}
<Grid item xs={12} lg={5}>
<NextActionsPanel />
</Grid>
        </Grid>
      </Box>
    </Box>
  );
}