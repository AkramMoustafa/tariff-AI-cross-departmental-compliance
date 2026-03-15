import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  MenuItem,
} from "@mui/material";
import { extractPO } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { COUNTRIES } from "@/constants/countries";
function getCountryCode(name: string) {
  const match = COUNTRIES.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );
  return match ? match.code : "";
}
export default function PrePOIntake() {

  const navigate = useNavigate();
  const [supplier, setSupplier] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [incoterm, setIncoterm] = useState("");
  const [aiExtracted, setAiExtracted] = useState(false);
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [lineItems, setLineItems] = useState([
    { description: "", hsCode: "", quantity: "", unitPrice: "" },
  ]);
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
      { description: "", hsCode: "", quantity: "", unitPrice: "" },
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

    console.log("PO extraction:", data);

    // Supplier
    if (data.supplier) {
      setSupplier(data.supplier);
    }

    // Origin country
if (data.origin_country) {
  setOrigin(getCountryCode(data.origin_country));
}

if (data.destination_country) {
  setDestination(getCountryCode(data.destination_country));
}

    // Incoterm (comes from shipping_terms)
    if (data.shipping_terms) {
      setIncoterm(data.shipping_terms);
    }

    // Line items
    if (data.items && Array.isArray(data.items)) {
      setLineItems(
        data.items.map((item: any) => ({
          description: item.description || "",
          hsCode: item.hs_code || "",
          quantity: item.qty ? String(item.qty) : "",
          unitPrice: item.price ? String(item.price) : "",
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
          Trade Intake
        </Typography>

        <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1 }}>
          Create Pre-Purchase Review
        </Typography>

        <Typography sx={{ fontSize: 14, color: "#475569", mb: 4 }}>
          Upload a draft PO and extract structured trade data before review.
        </Typography>

        {/* Upload Section */}
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
        variant="outlined"
        component="label"
        sx={{ borderRadius: "10px", textTransform: "none" }}
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
        <Button
          variant="outlined"
          component="label"
          sx={{ borderRadius: "10px", textTransform: "none" }}
        >
          Replace File
          <input hidden type="file" onChange={handleFileChange} />
        </Button>

        <Button
          variant="text"
          color="error"
          onClick={() => setUploadedFile(null)}
          sx={{ textTransform: "none" }}
        >
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
  variant="contained"
  onClick={handleAIExtract}
  disabled={!uploadedFile}
  sx={{
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    px: 4,
    py: 1.2,
    fontSize: 14,
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
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
                select
                fullWidth
                label="Origin Country"
                size="small"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="CN">China (CN)</MenuItem>
                <MenuItem value="DE">Germany (DE)</MenuItem>
                <MenuItem value="MX">Mexico (MX)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Destination"
                size="small"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="US">United States (US)</MenuItem>
                <MenuItem value="CA">Canada (CA)</MenuItem>
              </TextField>
            </Grid>

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
                    label="HS Code"
                    value={item.hsCode}
                    sx={inputSx}
                    onChange={(e) =>
                      updateLineItem(index, "hsCode", e.target.value)
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
            </Box>
          ))}

          <Button
            onClick={addLineItem}
            sx={{ textTransform: "none", fontWeight: 600, color: "#1e3a8a" }}
          >
            + Add Line Item
          </Button>
        </Paper>
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
  <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>
    Shipment Costs
  </Typography>

  <Grid container spacing={3}>

    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="Freight"
        size="small"
        value={freight}
        onChange={(e) => setFreight(e.target.value)}
        sx={inputSx}
      />
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="Insurance"
        size="small"
        value={insurance}
        onChange={(e) => setInsurance(e.target.value)}
        sx={inputSx}
      />
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="Other Charges"
        size="small"
        value={otherCharges}
        onChange={(e) => setOtherCharges(e.target.value)}
        sx={inputSx}
      />
    </Grid>

  </Grid>
</Paper>

        {/* Actions */}
        <Stack direction="row" justifyContent="space-between">
          <Button variant="outlined" sx={{ borderRadius: "10px" }}>
            Save Draft
          </Button>

<Button
  variant="contained"
onClick={() => {
  const hasValidHsCode = lineItems.every(item => item.hsCode.trim() !== "");

  if (!hasValidHsCode) {
    alert("Each line item must have an HS Code before running the trade review.");
    return;
  }

  navigate("/TradeReviewResult", {
    state: {
      supplier,
      origin,
      destination,
      currency,
      incoterm,
      lineItems,
      freight,
      insurance,
      otherCharges,
      goodsTotal,
      shipmentTotal
    }
  });
}}
  sx={{
    backgroundColor: "#1e3a8a",
    borderRadius: "10px",
    textTransform: "none",
    "&:hover": { backgroundColor: "#1e40af" },
  }}
>
  Run Trade Review
</Button>
        </Stack>
      </Box>
    </Box>
  );
}
