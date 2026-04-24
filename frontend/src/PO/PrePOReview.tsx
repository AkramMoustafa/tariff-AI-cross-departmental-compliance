import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Divider,
  MenuItem,
} from "@mui/material";
import { extractPO, savePO } from "@/api/po";
import { predictPO } from "@/api/po";
import { useNavigate } from "react-router-dom";
import { COUNTRIES } from "@/constants/countries";
import { Collapse } from "@mui/material";
import RunRiskAnalysisCard from "@/PO/RunRiskAnalysisCard";
import FinalAnalysisCard from "@/PO/FinalAnalysisCard";
import StaticDecisionCard from "@/PO/TariffEstimator"
import ProductValidationCard from "./ProductValidationCard";
import RiskDecisionCard from "@/PO/RiskDecisionCard";

function getCountryCode(name: string) {
  const match = COUNTRIES.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );
  return match ? match.code : "";
}

export default function PrePOIntake() {
  const baseButton = {
  textTransform: "none",
  borderRadius: "12px",
  fontWeight: 600,
  px: 2,
  py: 1,
  fontSize: 13,
};


const primaryButton = {...baseButton,background: "linear-gradient(135deg, #1d4ed8, #2563eb)",color: "#fff",};
const secondaryButton = {
  ...baseButton,
  border: "1px solid #e2e8f0",
  color: "#0f172a",
  backgroundColor: "#f8fafc",
  "&:hover": {
    backgroundColor: "#f1f5f9",
  },
};
const [weight, setWeight] = useState("");
const [routeType, setRouteType] = useState("");
const [productCategory, setProductCategory] = useState("");
const [poId, setPoId] = useState<number | null>(null);
const [total, setTotal] = useState("");
const [showDetails, setShowDetails] = useState(true);
const [prediction, setPrediction] = useState<any>(null);
const navigate = useNavigate();
const [supplier, setSupplier] = useState("");
const [origin, setOrigin] = useState("");
const [destination, setDestination] = useState("");
const [currency, setCurrency] = useState("USD");
const [incoterm, setIncoterm] = useState("");
const [aiExtracted, setAiExtracted] = useState(false);
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
const [originCity, setOriginCity] = useState("");
const [destinationCity, setDestinationCity] = useState("");
const [shippingMethod, setShippingMethod] = useState("");
const [subtotal, setSubtotal] = useState("");
const [tax, setTax] = useState("");
const [showResult, setShowResult] = useState(false);
const [lineItems, setLineItems] = useState([
  { description: "", quantity: "", unitPrice: "" },
]);
const [validatedItems, setValidatedItems] = useState([]);
const [showStep3, setShowStep3] = useState(false);
const [loading, setLoading] = useState(false);
const [freight, setFreight] = useState("");
const [insurance, setInsurance] = useState("");
const [otherCharges, setOtherCharges] = useState("");
const goodsTotal = lineItems.reduce((sum, item) => {
  const qty = parseFloat(item.quantity || "0");
  const price = parseFloat(item.unitPrice || "0");

  return sum + qty * price;
}, 0);
const shipmentTotal =
  goodsTotal +
  parseFloat(freight || "0") +
  parseFloat(insurance || "0") +
  parseFloat(otherCharges || "0");


  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: "", unitPrice: "" },
    ]);
  };
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploadedFile(file);
  setAiExtracted(false);
};
  const updateLineItem = (index: number, field: string, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };
const handleAIExtract = async () => {
  if (!uploadedFile) return;

  setLoading(true);

  try {
    const response = await extractPO(uploadedFile);

    const data = response.data || response.extraction || response;
    console.log("========== DEBUG ==========");
    console.log("FULL RESPONSE:", response);
    console.log("PO DATA:", data.po);
    console.log("FINANCIALS:", data.financials);
    console.log("===========================");
    console.log("PO extraction:", data);

   const po = data.po;
const financials = data.financials;

if (po.origin_city) setOriginCity(po.origin_city);
if (po.destination_city) setDestinationCity(po.destination_city);
if (po.shipping_method) setShippingMethod(po.shipping_method);
if (po.origin_country) {
  setOrigin(po.origin_country);
}

if (po.destination_country) {
  setDestination(po.destination_country);
}
if (financials.subtotal) {
  setSubtotal(String(financials.subtotal));
}

if (financials.tax) {
  setTax(String(financials.tax));
}

if (financials.total) {
  setTotal(String(financials.total));
}if (financials.shipping) {
  setFreight(String(financials.shipping));
}
if (po.items && Array.isArray(po.items)) {
  setLineItems(
    po.items.map((item: any) => ({
      description: item.description || "",
      quantity: item.quantity ? String(item.quantity) : "",
      unitPrice: item.unit_price ? String(item.unit_price) : "",
    }))
  );
}
    setAiExtracted(true);

  } catch (err) {
    console.error("PO extraction failed", err);
  } finally {
    setLoading(false);
  }
};
  const [showValidation, setShowValidation] = useState(false);
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f8fafc",
      fontSize: 14,
      "& fieldset": { borderColor: "#e5e7eb" },
      "&:hover fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused fieldset": {
        borderColor: "#1e3a8a",
        borderWidth: 1.5,
      },
    },
  };

  const sectionCard = {
    p: 4,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
  };
  const handleSavePO = async () => {
  try {
    const payload = {
      supplier,
      origin_city: originCity,
      origin_country: origin,
      destination_city: destinationCity,
      destination_country: destination,
      shipping_method: shippingMethod,

      items: lineItems.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unitPrice),
      })),

      subtotal: Number(subtotal),
      tax: Number(tax),
      shipping: Number(freight),
      total: Number(total),

      weight: Number(weight),
      route_type: routeType,
      product_category: productCategory,
    };

    const res = await savePO(payload);

    console.log("PO saved:", res);

    return res;

  } catch (err) {
    console.error("Save failed", err);
    throw err;
  }
};
const canProceedToTariff = aiExtracted;

const [showTariff, setShowTariff] = useState(false);
const [showStep4, setShowStep4] = useState(false);
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
<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: 4,
  }}
>
  {/* LEFT SIDE */}
  <Box>
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
      Trade Intake
    </Typography>

    <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1 }}>
      Create Pre-Purchase Review
    </Typography>

    <Typography sx={{ fontSize: 14, color: "#475569" }}>
      Upload a draft PO and extract structured trade data before review.
    </Typography>
  </Box>

  {/* RIGHT SIDE BUTTON */}
  <Button
    variant="text"
    onClick={() => setShowDetails(!showDetails)}
    sx={{
      textTransform: "none",
      fontSize: 13,
      fontWeight: 500,
      color: "#64748b",
      mt: 1,
      "&:hover": {
        backgroundColor: "transparent",
        color: "#1e3a8a",
      },
    }}
  >
    {showDetails ? "Hide ▲" : "🔍 Details ▼"}
  </Button>
</Box>

        {/* Upload Section */}
        <Collapse in={showDetails}>
       <Paper
  elevation={0}
  sx={{
    ...sectionCard,
    border: uploadedFile
      ? "1px solid #2563eb"
      : "1px dashed #cbd5e1",
    backgroundColor: uploadedFile ? "#eff6ff" : "#f8fafc",
    textAlign: "center",
    mb: 5,
    transition: "all 0.3s ease",
  }}
>
  {!uploadedFile ? (
    <>
      <Typography fontWeight={600} mb={1}>
        Upload Draft PO (Optional)
      </Typography>

      <Typography fontSize={13} color="#64748b" mb={2}>
       PDF only. AI extraction will auto-fill fields.
      </Typography>

      <Button

        component="label"
      sx={secondaryButton}
      >
        Upload File
        <input hidden type="file" onChange={handleFileChange} />
      </Button>
    </>
  ) : (
    <>
      <Typography fontWeight={600} mb={1}>
        File Ready for Extraction
      </Typography>

      <Typography fontSize={14} fontWeight={500} color="#1e3a8a">
        {uploadedFile.name}
      </Typography>

      <Typography fontSize={12} color="#64748b" mb={2}>
        {(uploadedFile.size / 1024).toFixed(1)} KB
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
      <Button  component="label" sx={secondaryButton}>Replace File<input hidden type="file" onChange={handleFileChange} /></Button>
      <Button onClick={() => setUploadedFile(null)}sx={{...secondaryButton,color: "#dc2626",borderColor: "#fecaca",}}>
          Remove
        </Button>
      </Stack>
    </>
  )}
</Paper>
{/* AI Extraction Section */}
<Box
  sx={{
    mb: 5,
    p: 4,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 3,
  }}
>
  {/* Left Side - Explanation */}
  <Box>
    <Typography fontWeight={600} mb={0.5}>
      AI Document Extraction
    </Typography>
    <Typography fontSize={13} color="#64748b">
      Automatically extract supplier, trade, and line-item data from the uploaded PO.
    </Typography>
  </Box>

  {/* Right Side - Button */}
<Button
  onClick={handleAIExtract}
  disabled={!uploadedFile || loading}
  sx={{
    ...primaryButton,
    px: 4,
    py: 1.2,
    fontSize: 14,
    opacity: !uploadedFile ? 0.6 : 1,
  }}
>
  {loading ? "Extracting..." : "Extract with AI"}
</Button>
</Box>
        {/* Pre-PO Details */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>
            Pre-PO Details
          </Typography>

         <Grid container spacing={3}>

  {/* Supplier */}
  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Supplier"
      size="small"
      value={supplier}
      onChange={(e) => setSupplier(e.target.value)}
      sx={inputSx}
    />
  </Grid>

<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    label="Origin (City, Country)"
    size="small"
    value={`${originCity}${origin ? ", " + origin : ""}`}
    onChange={(e) => {
      const value = e.target.value;

      const parts = value.split(",");

      setOriginCity(parts[0]?.trim() || "");
      setOrigin(parts[1]?.trim().toUpperCase() || "");
    }}
    placeholder="e.g. Shenzhen, CN"
    sx={inputSx}
  />
</Grid>
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    label="Destination (City, Country)"
    size="small"
    value={`${destinationCity}${destination ? ", " + destination : ""}`}
    onChange={(e) => {
      const value = e.target.value;
      const parts = value.split(",");

      const city = parts[0]?.trim() || "";
      const countryRaw = parts[1]?.trim() || "";

      setDestinationCity(city);
      setDestination(getCountryCode(countryRaw)); // same logic
    }}
    placeholder="e.g. Rotterdam, NL"
    sx={inputSx}
  />
</Grid>

  {/* Incoterm */}
  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Incoterm"
      size="small"
      value={incoterm}
      onChange={(e) => setIncoterm(e.target.value)}
      sx={inputSx}
    />
  </Grid>


  {/* Shipping Method */}
  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Shipping Method"
      size="small"
      value={shippingMethod}
      onChange={(e) => setShippingMethod(e.target.value)}
      sx={inputSx}
    />
  </Grid>

  {/* Currency */}
  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Currency"
      size="small"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      sx={inputSx}
    />
  </Grid>

</Grid>
</Paper>
        {/* Line Items */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>
            Line Items
          </Typography>

          {lineItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 3,
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                mb: 3,
              }}
            >
              <Grid container spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={item.description}
                      sx={inputSx}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      sx={inputSx}
                      onChange={(e) =>
                        updateLineItem(index, "quantity", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Unit Price"
                      type="number"
                      value={item.unitPrice}
                      sx={inputSx}
                      onChange={(e) =>
                        updateLineItem(index, "unitPrice", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} md={4}>
 
</Grid>

              </Grid>
            </Box>
          ))}

<Button
  onClick={addLineItem}
  sx={secondaryButton}
>
            + Add Line Item
          </Button>
        </Paper>
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
  <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>
    Shipment Costs
  </Typography>

  <Grid container spacing={3}>

   <Grid item xs={12} md={3}>
  <TextField
    fullWidth
    label="Subtotal"
    size="small"
    value={subtotal}
    onChange={(e) => setSubtotal(e.target.value)}
    sx={inputSx}
  />
</Grid>

<Grid item xs={12} md={3}>
  <TextField
    fullWidth
    label="Tax"
    size="small"
    value={tax}
    onChange={(e) => setTax(e.target.value)}
    sx={inputSx}
  />
</Grid>

<Grid item xs={12} md={3}>
  <TextField
    fullWidth
    label="Shipping"
    size="small"
    value={freight} // THIS HOLDS shipping
    onChange={(e) => setFreight(e.target.value)}
    sx={inputSx}
  />
</Grid>

<Grid item xs={12} md={3}>
  <TextField
    fullWidth
    label="Total"
    size="small"
    value={total}
    onChange={(e) => setTotal(e.target.value)}
    sx={inputSx}
  />
</Grid>
  </Grid>
  <Grid container spacing={3} sx={{ mt: 1 }}>

  {/* Weight */}
  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Total Weight (kg)"
      size="small"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
      sx={inputSx}
      type="number"
      required
    />
  </Grid>

  {/* Route Type */}
  <Grid item xs={12} md={4}>
    <TextField
      select
      fullWidth
      label="Route Type"
      size="small"
      value={routeType}
      onChange={(e) => setRouteType(e.target.value)}
      sx={inputSx}
    >
      <MenuItem value="Suez">Suez</MenuItem>
      <MenuItem value="Panama">Panama</MenuItem>
      <MenuItem value="Transpacific">Transpacific</MenuItem>
      <MenuItem value="Transatlantic">Transatlantic</MenuItem>
    </TextField>
  </Grid>

  {/* Product Category */}
  <Grid item xs={12} md={4}>
    <TextField
      select
      fullWidth
      label="Product Category"
      size="small"
      value={productCategory}
      onChange={(e) => setProductCategory(e.target.value)}
      sx={inputSx}
    >
      <MenuItem value="Electronics">Electronics</MenuItem>
      <MenuItem value="Pharmaceuticals">Pharmaceuticals</MenuItem>
      <MenuItem value="Machinery">Machinery</MenuItem>
      <MenuItem value="Food">Food</MenuItem>
    </TextField>
  </Grid>

</Grid>


</Paper>
</Collapse>

      </Box>
<Box sx={{ mt: 4 }}>
  <Divider sx={{ mb: 2 }} />

  <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
    STEP 2
  </Typography>

  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
    Verify your prodcuts
  </Typography>

  <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.5 }}>
   Verify your products before running tariff analysis.
  </Typography>

<Button
  disabled={!canProceedToTariff}
  onClick={() => setShowValidation(!showValidation)}
  sx={{
    ...primaryButton,
    mt: 2,
    px: 3,
    py: 1.2,
    fontSize: 14,
    opacity: !canProceedToTariff ? 0.6 : 1,
  }}
>
  Verify Products →
</Button>
</Box>

<Collapse in={showValidation}>
  <Box sx={{ mt: 2 }}>
<ProductValidationCard 
  lineItems={lineItems}
  onUpdate={setValidatedItems}
/>
  </Box>

  
  
</Collapse>
<Box sx={{ mt: 4 }}>
  <Divider sx={{ mb: 2 }} />

  <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
    STEP 3
  </Typography>

  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
    Tariff & Cost Analysis
  </Typography>

  <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.5 }}>
   Calculate tariffs for your product.
  </Typography>

<Button
  disabled={!canProceedToTariff}
  onClick={() => setShowStep3(!showStep3)}
  sx={{
    ...primaryButton,
    mt: 2,
    px: 3,
    py: 1.2,
    fontSize: 14,
    opacity: !canProceedToTariff ? 0.6 : 1,
  }}
>
  Run Tariff Analysis →
</Button>
</Box>
<Box sx={{ mt: 4 }}>
  <Divider sx={{ mb: 2 }} />

  <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
    STEP 4
  </Typography>

  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
    Trade Risk Analysis
  </Typography>

  <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.5 }}>
    Analyze geopolitical, weather, and supplier risk before approval.
  </Typography>

  <Button
    disabled={!showStep3}
    onClick={() => setShowStep4(!showStep4)}
  sx={{
    ...primaryButton,
    mt: 2,
    px: 3,
    py: 1.2,
    fontSize: 14,
    opacity: !canProceedToTariff ? 0.6 : 1,
  }}
  >
    Run Risk Analysis →
  </Button>
</Box>
<Collapse in={showStep4}>
  <Box sx={{ mt: 2 }}>
    <RiskDecisionCard />
  </Box>
</Collapse>
<Collapse in={showStep3}>
  <Box sx={{ mt: 2 }}>
<StaticDecisionCard 
  items={validatedItems} 
  origin={origin}
/>
  </Box>

  

</Collapse>
 

    </Box>
    
  );
}
