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
import { calculateDuty,   exportTariffPdf,type DutyCalculationResponse } from "@/api/tariffClient";
import { useState } from "react";
import { usePaymentStatus } from "@/api/payment";
import { useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import NextActionsPanel from "./NextActionsPanel"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

export default function TariffCalculator() {
  const { paid, loading: paymentLoading } = usePaymentStatus();
  const navigate = useNavigate();
  const [hsCode, setHsCode] = useState("");
  const [origin, setOrigin] = useState("CN");
  const [destination, setDestination] = useState("US");
  const [customsValue, setCustomsValue] = useState(10000);
  const [freight, setFreight] = useState(500);
  const [insurance, setInsurance] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DutyCalculationResponse | null>(null);
  const [hsTree, setHsTree] = useState<any | null>(null);
  const [hsLoading, setHsLoading] = useState(false);
  const [hsError, setHsError] = useState<string | null>(null);
  const handleClearForm = () => {
  setHsCode("");
  setOrigin("CN");
  setDestination("US");
  setCustomsValue(0);
  setFreight(0);
  setInsurance(0);

  setResult(null);
  setError(null);
  setHsTree(null);
  setHsError(null);
};

useEffect(() => {
  const normalizedHs = hsCode.replace(/\D/g, "");

  console.log("RAW:", hsCode, "NORMALIZED:", normalizedHs);

  if (normalizedHs.length < 2) {
    setHsTree(null);
    return;
  }

  const controller = new AbortController();

  const fetchHsTree = async () => {
    console.log("FETCH HS TREE CALLED");

    setHsLoading(true);
    setHsError(null);

    try {
      const res = await fetch(
        `http://localhost:8000/tariffs/hs/tree?hs_code=${normalizedHs}`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error("HS lookup failed");

      const data = await res.json();
      console.log("HS TREE RESPONSE:", data.tree);

      setHsTree(data.tree);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
        setHsTree(null);
        setHsError("HS code not found");
      }
    } finally {
      setHsLoading(false);
    }
  };

  fetchHsTree();
  return () => controller.abort();
}, [hsCode]);

  const downloadPDF = async () => {
  if (!result || !paid) return;

  try {
    const blob = await exportTariffPdf({
      ...result,
      applied_tariff_lines: tariffLines,
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tariff_calculation.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF export failed:", err);
  }
};

    const handleCalculate = async () => {

      setLoading(true);
      setError(null);

      try {
        const data = await calculateDuty({
          hs_code: hsCode,
          origin_country: origin,
          customs_value: customsValue,
          freight,
          insurance,
        });
        setResult(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Calculation failed");
      } finally {
        setLoading(false);
      }
    };
  const [error, setError] = useState<string | null>(null);
const tariffLines = result
  ? [
      // MFN
      {
        dutyType: "MFN Duty",
        description: "Most Favored Nation",
        rateType: "Ad Valorem",
        rate: `${result.calculated_duties.base_rate_percent.toFixed(2)}%`,
        reference: `HTSUS ${result.hs_code}`,
        amount:
          (result.calculated_duties.base_rate_percent / 100) *
          result.duty_payable.dutiable_value,
      },

      // Section 301 (only if applies)
      ...(result.section_301?.applies
        ? [
            {
              dutyType: "Section 301",
              description: "China Trade Remedy",
              rateType: "Ad Valorem",
              rate: `${result.calculated_duties.section301_rate_percent?.toFixed(2)}%`,
              reference: result.section_301.chapter_99_code,
              amount:
                (result.calculated_duties.section301_rate_percent! / 100) *
                result.duty_payable.dutiable_value,
            },
          ]
        : []),
    ]
  : [];
  const landedCost =
  result
    ? result.duty_payable.dutiable_value +
      result.duty_payable.total_duty_payable
    : 0;

  const normalizedHs = hsCode.replace(/\D/g, "");

const effectiveHsNode = hsTree
  ?.filter((n: any) => normalizedHs.startsWith(n.parent_code))
  .sort((a: any, b: any) => b.parent_code.length - a.parent_code.length)[0];

const headingNode = hsTree?.find((n: any) => n.parent_code.length === 4);
const showHsInfo =
  normalizedHs.length >= 4 &&
  !hsLoading &&
  !hsError &&
  !!effectiveHsNode;

  return (
    <Box
      sx={{
        // I removed minHeight: "100vh" and overflow: "hidden".
        // Having 100vh here caused the sidebar to get pushed off screen.
        position: "relative",
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

      {/* CONTENT LAYER */}
      <Box sx={{
        position: "relative",
        zIndex: 1,
        // center everything with a max width and horizontal padding
        maxWidth: "1400px",
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        // had maxWidth: "900px" here before which was cutting off the NextActionsPanel
        width: "100%",
      }}>

        {/* HEADER META */}
        <Box sx={{ mb: 2 }}>
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

          <Typography variant="h4" fontWeight={600} mb={0.5}>
            HS Code Tariff Calculator
          </Typography>

          <Typography variant="body2" fontSize={12} color="text.secondary">
            Official tariff calculations based on Harmonized Tariff Schedule (HTS)
            schedules.
          </Typography>
          <Typography
            variant="body2"
            fontSize={12}
            color="text.secondary"
            mb={3}
          >
            Enter shipment details below to receive an instant, auditable duty
            estimate and compliance breakdown.
          </Typography>
        </Box>

        {/* MAIN LAYOUT */}
        {/* 
          I Switched from Grid with wrap="nowrap" to flex.
          Grid nowrap caused horizontal overflow on small screens.
          Flex + responsive flexDirection lets us stack on mobile. -- Reddit Said So.
        */}
        <Box sx={{
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
          flexDirection: { xs: "column", lg: "row" },
        }}>

          {/* LEFT: Shipment Parameters */}
          <Box sx={{
            flex: 1,
            // Without minWidth: 0, wide content can overflow the container.
            minWidth: 0,
            width: { xs: "100%", lg: "auto" },
          }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                // Previously width was set using vh which ignores the container. -- vh can cause bugs on mobile browsers. 
                minHeight: { xs: "auto", md: "480px" },
                position: "relative",
                overflow: "hidden",
                bgcolor: "#ffffff",
                border: "1px solid #e5e7eb",
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
                  zIndex: 2
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
<Button
  variant="text"
  size="small"
  onClick={handleClearForm}
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
                }}
              >


                <Button
                    
                variant="contained"
                onClick={handleCalculate}
                disabled={loading || !hsCode}
                  
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
                  {loading ? "Calculating..." : "Calculate"}
                </Button>
              </Box>

              <Box
                sx={{
                  fontFamily: "inter",
                  position: "relative",
                  pt: "40px",
                  pb: "50px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
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
                 {/* SEARCH RESULT */}
{showHsInfo && (
  <Box
    sx={{
      mt: 1.5,
      p: 1.5,
      borderRadius: 1,
      bgcolor: "rgba(37, 99, 235, 0.06)",
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
        {effectiveHsNode.description}
      </Typography>

      {headingNode && (
        <Typography
          sx={{
            fontSize: 12,
            color: "#1e3a8a",
            opacity: 0.8,
          }}
        >
          {`Heading ${headingNode.parent_code} · ${headingNode.description}`}
        </Typography>
      )}
    </Box>
  </Box>
)}

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
                      select
                      fullWidth
                      size="small"
                      value="US"
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
                {/* CURRENCY / VALUES */}
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
                      select
                      fullWidth
                      size="small"
                      value="USD"
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
                      type="number"
                      fullWidth
                      size="small"
                        value={customsValue}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomsValue(v === "" ? 0 : Number(v));
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
                      type="number"
                      fullWidth
                      size="small"
                      value={freight}
                      
                      onChange={(e) => {
                        const v = e.target.value;
                        setFreight(v === "" ? 0 : Number(v));
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
                      type="number"
                      fullWidth
                      size="small"

                      value={insurance}
                       onChange={(e) => {
                        const v = e.target.value;
                        setInsurance(v === "" ? 0 : Number(v));
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
                </Box>
              </Box>

            </Paper>
          </Box>

          {/* RIGHT COLUMN */}
          <Box
            sx={{
              // On mobile this becomes full width and stacks below. -- On desktop it becomes a fixed-width sidebar.
              width: { xs: "100%", lg: 320 },
              flexShrink: 0,
              // Sticky only on desktop so it doesn't break mobile scrolling.
              position: { xs: "relative", lg: "sticky" },
              top: { lg: 32 },
            }}
          >
            <NextActionsPanel
                canExportPdf={paid && !!result}
                onExportPdf={downloadPDF}
                onFindSuppliers={() => navigate("/suppliers")}
                onSaveCalculation={() => {
                  console.log("Save calculation", result);
                  // later → POST to /compliance/log
                }}
              />
          </Box>
        </Box>
<Grid container spacing={2} sx={{ mt: 4, alignItems: "stretch" }}>
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

            <Typography fontSize={22} fontWeight={700}>
              {result
                ? `$${result.duty_payable.total_duty_payable.toFixed(2)}`
                : "--"}
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
                 height: "100%",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography fontSize={11} color="text.secondary">
                EFFECTIVE RATE
              </Typography>

              <Typography fontSize={22} fontWeight={700}>
                {result
                  ? `${result.calculated_duties.total_rate_percent.toFixed(2)}%`
                  : "--"}
              </Typography>
                  {result?.section_301?.applies && (
              <Chip
                label="Section 301 Applied"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
            </Paper>
          </Grid>
        </Grid>

    <Box sx={{ position: "relative", mt: 3 }}>
      {/* BLURRED CONTENT */}
      <Box
        sx={{
          filter: paid ? "none" : "blur(6px)",
          pointerEvents: paid ? "auto" : "none",
          transition: "filter 0.25s ease",
        }}
      >
    <Paper
          sx={{
            mt: 3,
            p: 2,
            height: "100%", 
            borderRadius: 1.5,
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography fontSize={14} fontWeight={600} mb={2}>
            Applied Tariff Lines
          </Typography>

          {/* HEADER */}
{!result ? (
  // 🟦 STATE 1: No calculation yet
  <Box
    sx={{
      py: 6,
      textAlign: "center",
      color: "#64748b",
    }}
  >
    <Typography fontSize={14} fontWeight={500} mb={0.5}>
      No duties calculated yet
    </Typography>
    <Typography fontSize={12}>
      Enter shipment details and click <b>Calculate</b> to view applied tariff
      lines.
    </Typography>
  </Box>
) : tariffLines.length === 0 ? (
  // 🟦 STATE 2: Calculated, but no extra tariffs
  <Box
    sx={{
      py: 6,
      textAlign: "center",
      color: "#64748b",
    }}
  >
    <Typography fontSize={14} fontWeight={500}>
      No additional tariffs apply
    </Typography>
    <Typography fontSize={12}>
      This shipment is subject only to the base MFN duty.
    </Typography>
  </Box>
) : (
  // 🟩 STATE 3: Normal table
  <>
    {/* HEADER */}
    <Grid container spacing={1} sx={{ fontSize: 13, mb: 1 }}>
      {["Duty Type", "Rate Type", "Rate", "Base", "Reference", "Amount"].map((h) => (
        <Grid item xs={2} key={h}>
          <Typography fontSize={11} color="text.secondary">
            {h.toUpperCase()}
          </Typography>
        </Grid>
      ))}
    </Grid>

    <Divider sx={{ mb: 1 }} />

    {/* ROWS */}
    {tariffLines.map((line, idx) => (
      <Box key={idx}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={2.4}>
            <Typography fontWeight={500}>{line.dutyType}</Typography>
            <Typography fontSize={11} color="text.secondary">
              {line.description}
            </Typography>
          </Grid>

          <Grid item xs={2.4}>
            <Chip label={line.rateType} size="small" />
          </Grid>

          <Grid item xs={2.4}>{line.rate}</Grid>

          <Grid item xs={2.4}>
            <Typography fontSize={12} color="primary">
              {line.reference}
            </Typography>
          </Grid>

          <Grid item xs={2.4} textAlign="right">
            <Typography fontWeight={600}>
              ${line.amount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />
      </Box>
    ))}

    {/* TOTAL */}
    <Grid container>
      <Grid item xs={9.6} textAlign="right">
        <Typography fontWeight={600}>Estimated Total</Typography>
      </Grid>
      <Grid item xs={2.4} textAlign="right">
        <Typography fontWeight={700}>
          ${result.duty_payable.total_duty_payable.toFixed(2)}
        </Typography>
      </Grid>
    </Grid>
  </>
)}
      </Paper>
      </Box>
        {/* 2️⃣ OVERLAY — THIS IS WHERE IT GOES */}
  {!paid && (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(2px)",
        zIndex: 2,
      }}
    >
      <UpgradeOverlay />
    </Box>
  )}
      </Box>

      </Box>
    </Box>
  );
}
  function UpgradeOverlay() {
const navigate = useNavigate();  

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px dashed #cbd5e1",
        textAlign: "center",
        maxWidth: 300,
        bgcolor: "#ffffff",
      }}
    >
      <LockOutlinedIcon
        sx={{ fontSize: 64, color: "#2563eb", mb: 1 }}
      />

      <Typography fontWeight={600} mb={0.5}>
        Detailed Tariff Breakdown
      </Typography>

      <Typography fontSize={13} color="text.secondary" mb={2}>
        Unlock Section 301 details and exports with the Perform plan.
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={() => navigate("/pricing")}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        Upgrade Plan
      </Button>
    </Paper>
  );
}