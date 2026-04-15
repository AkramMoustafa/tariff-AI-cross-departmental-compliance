import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import { autoClassify } from "@/api/tariffClient"; 
import { useEffect } from "react";
type LineItem = {
  description: string;
  normalizedDescription?: string;
  quantity: string;
  unitPrice: string;
  hsCode?: string;
};
type Props = {
  lineItems: LineItem[];
  onUpdate: (items: LineItem[]) => void;
};


type EditableLineItem = {
  originalDescription: string;
  improvedDescription: string;
  quantity: string;
  unitPrice: string;
  suggestedHSCode: string;
  confirmedHSCode: string;
  descriptionConfidence: "LOW" | "MEDIUM" | "HIGH";
  hsConfidence: "LOW" | "MEDIUM" | "HIGH";
  alternatives?: { code: string; description: string }[];
};

const ProductValidationCard = ({ lineItems, onUpdate }: Props) => {
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f8fafc",
      fontSize: 14,
    },
    "& .MuiInputLabel-root": {
      fontSize: 14,
    },
    "& .MuiFormHelperText-root": {
      marginLeft: 0,
      fontSize: 12,
    },
  };

  const getDescriptionConfidence = (
    desc: string
  ): "LOW" | "MEDIUM" | "HIGH" => {
    if (!desc || desc.trim().length < 8) return "LOW";
    if (desc.trim().length < 20) return "MEDIUM";
    return "HIGH";
  };

useEffect(() => {
  setItems(prev =>
    lineItems.map((item, index) => {
      const existing = prev[index];

      return {
        originalDescription: item.description || "",
        improvedDescription:
          existing?.improvedDescription ||
          item.normalizedDescription ||
          item.description ||
          "",

        quantity: item.quantity || "",
        unitPrice: item.unitPrice || "",

        suggestedHSCode: existing?.suggestedHSCode || item.hsCode || "",
        confirmedHSCode: existing?.confirmedHSCode || item.hsCode || "",

        descriptionConfidence: getDescriptionConfidence(
          item.normalizedDescription || item.description || ""
        ),

        hsConfidence: existing?.hsConfidence || "LOW",
        alternatives: existing?.alternatives || [],
      };
    })
  );
}, [lineItems]);

  const getConfidenceColor = (level: "LOW" | "MEDIUM" | "HIGH") => {
    if (level === "LOW") return "error";
    if (level === "MEDIUM") return "warning";
    return "success";
  };

  const improveDescriptionWithAI = (desc: string) => {
    const text = desc.toLowerCase();

    if (text.includes("cnc") || text.includes("machine")) {
      return "Industrial CNC milling machine (5-axis metalworking machine)";
    }

    if (text.includes("robot")) {
      return "Industrial robotic arm for automated manufacturing operations";
    }

    if (text.includes("bolt") || text.includes("fastener")) {
      return "Steel threaded bolts for industrial machinery assembly";
    }

    return desc.trim().length > 0
      ? `${desc.trim()} - specify material, industrial use, and product type`
      : "";
  };
const [items, setItems] = useState<EditableLineItem[]>([]);


const handleImproveDescription = (index: number) => {
  setItems((prev) =>
    prev.map((item, i) => {
      if (i !== index) return item;

      const improved = improveDescriptionWithAI(item.improvedDescription);

      return {
        ...item,
        improvedDescription: improved,
        descriptionConfidence: getDescriptionConfidence(improved),

        // ❌ REMOVE THIS:
        // suggestedHSCode: hsSuggestion.code,
        // hsConfidence: hsSuggestion.confidence
      };
    })
  );
};

const handleClassifyHS = async (index: number) => {
  const item = items[index];

  if (!item.improvedDescription.trim()) {
    alert("Add description first");
    return;
  }

  try {
    const res = await autoClassify({
      description: item.improvedDescription,
    });

    console.log("API RESULT:", res); // 🔥 DEBUG

    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;

        return {
          ...it,

          // ✅ PURE API
          suggestedHSCode:
               res.suggested?.code || "",

          hsConfidence: (res.confidence || "LOW").toUpperCase() as
            | "LOW"
            | "MEDIUM"
            | "HIGH",

          confirmedHSCode:
            it.confirmedHSCode && it.confirmedHSCode.length > 0
              ? it.confirmedHSCode
              : res.suggested?.code || "",

          alternatives: res.alternatives || [],
        };
      })
    );
  } catch (err) {
    console.error("Classification failed", err);
  }
};
  const handleFieldChange = (
    index: number,
    field: keyof EditableLineItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updatedItem = {
          ...item,
          [field]: value,
        };

        if (field === "improvedDescription") {
          updatedItem.descriptionConfidence = getDescriptionConfidence(value);
        }

        return updatedItem;
      })
    );
  };
useEffect(() => {
  const hasHS = items.some(item => item.confirmedHSCode);

  if (!hasHS) return;

  onUpdate(
    items.map(item => ({
      description: item.improvedDescription,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      hsCode: item.confirmedHSCode
    }))
  );
}, [items]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: "18px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
        mb: 4,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
          Product Classification & Validation
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.5 }}>
          Improve product descriptions, run AI classification, and confirm HS
          codes before tariff analysis.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              background:
                "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", md: "row" },
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}
                >
                  Product Item {index + 1}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                  Review AI-assisted classification for this line item
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={`Description: ${item.descriptionConfidence}`}
                  color={getConfidenceColor(item.descriptionConfidence)}
                  size="small"
                />
                <Chip
                  label={`HS Confidence: ${item.hsConfidence}`}
                  color={getConfidenceColor(item.hsConfidence)}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#475569",
                      mb: 0.75,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Original Description
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#0f172a",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.originalDescription || "No description available"}
                  </Typography>
                </Box>
              </Grid>
              {item.alternatives && item.alternatives.length > 0 && (
            <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>
                    Alternative Classifications
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {item.alternatives.map((alt, idx) => (
                    <Chip
                        key={idx}
                        label={`${alt.code}`}
                        size="small"
                        variant="outlined"
                        onClick={() =>
                        handleFieldChange(index, "confirmedHSCode", alt.code)
                        }
                    />
                    ))}
                </Stack>
                </Box>
            </Grid>
            )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Improved Description"
                  value={item.improvedDescription}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "improvedDescription",
                      e.target.value
                    )
                  }
                  sx={inputSx}
                  helperText="Use a precise commercial description with product type, material, and intended use."
                />
              </Grid>

              <Grid item xs={12}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mb: 0.5 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => handleImproveDescription(index)}
                    sx={{
                      textTransform: "none",
                      borderRadius: "12px",
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderColor: "#cbd5e1",
                      color: "#0f172a",
                    }}
                  >
                    ✨ Improve Description with AI
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => handleClassifyHS(index)}
                    sx={{
                      textTransform: "none",
                      borderRadius: "12px",
                      fontWeight: 700,
                      px: 2,
                      py: 1,
                      background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    }}
                  >
                    Classify HS Code with AI
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="AI Suggested HS Code"
                  value={item.suggestedHSCode}
                  InputProps={{ readOnly: true }}
                  sx={inputSx}
                  helperText="Generated from the improved product description."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Confirm or Override HS Code"
                  value={item.confirmedHSCode}
                  onChange={(e) =>
                    handleFieldChange(index, "confirmedHSCode", e.target.value)
                  }
                  sx={inputSx}
                  helperText="Edit only if your team already knows the correct classification."
                />
              </Grid>

              {(item.descriptionConfidence === "LOW" ||
                item.hsConfidence === "LOW") && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 0.5,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: "12px",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#b91c1c",
                        fontWeight: 600,
                      }}
                    >
                      Warning: The description may be too vague for reliable HS
                      classification. Add more detail before continuing.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        ))}
      </Stack>

      <Box
        sx={{
          mt: 3.5,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            py: 1.2,
            fontSize: 14,
            background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
          }}
        >
          Continue to Tariff Analysis →
        </Button>
      </Box>
    </Paper>
  );
};

export default ProductValidationCard;