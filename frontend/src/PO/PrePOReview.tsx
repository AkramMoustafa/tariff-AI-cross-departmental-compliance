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
  Divider,
} from "@mui/material";

export default function PrePOIntake() {
  const [lineItems, setLineItems] = useState([
    { description: "", hsCode: "", quantity: "", unitPrice: "" },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", hsCode: "", quantity: "", unitPrice: "" },
    ]);
  };

  const updateLineItem = (index: number, field: string, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f8fafc",
      fontSize: 14,
      "& fieldset": {
        borderColor: "#e5e7eb",
      },
      "&:hover fieldset": {
        borderColor: "#cbd5e1",
      },
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
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: 6,
        mb: 8,
        px: 3,
      }}
    >
      {/* Main Card */}
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

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 700,
            color: "#0f172a",
            mb: 1,
          }}
        >
          Create Pre-Purchase Review
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            color: "#475569",
            mb: 4,
          }}
        >
          Evaluate tariff exposure, sanctions risk, and landed cost impact
          before issuing a Purchase Order.
        </Typography>

        {/* Upload Section */}
        <Paper
          elevation={0}
          sx={{
            ...sectionCard,
            border: "1px dashed #cbd5e1",
            backgroundColor: "#f8fafc",
            textAlign: "center",
            mb: 5,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#eef2ff",
              borderColor: "#94a3b8",
            },
          }}
        >
          <Typography fontWeight={600} mb={1}>
            Upload Draft PO (Optional)
          </Typography>

          <Typography fontSize={13} color="#64748b" mb={2}>
            PDF, CSV, or Excel. We will extract line items and auto-fill fields.
          </Typography>

          <Button
            variant="outlined"
            component="label"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#cbd5e1",
                  "&:hover": {
      backgroundColor: "#1e40af",   // 👈 hover color
    },
              px: 3,
            }}
          >
            Upload File
            <input hidden type="file" />
          </Button>
        </Paper>

        {/* Metadata Section */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: "#0f172a",
              mb: 3,
            }}
          >
            Pre-PO Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Supplier" size="small" sx={inputSx} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Origin Country"
                size="small"
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
                sx={inputSx}
              >
                <MenuItem value="US">United States (US)</MenuItem>
                <MenuItem value="CA">Canada (CA)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Incoterm" size="small" sx={inputSx} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Currency"
                size="small"
                defaultValue="USD"
                sx={inputSx}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Line Items Section */}
        <Paper elevation={0} sx={{ ...sectionCard, mb: 5 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: "#0f172a",
              mb: 3,
            }}
          >
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
            sx={{
              mt: 1,
              textTransform: "none",
              fontWeight: 600,
              color: "#1e3a8a",
            }}
          >
            + Add Line Item
          </Button>
        </Paper>

        {/* Actions */}
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 500,
              borderColor: "#cbd5e1",
              px: 3,
            }}
          >
            Save Draft
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1e3a8a",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              "&:hover": {
                backgroundColor: "#1e40af",
              },
            }}
          >
            Run Trade Review
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}