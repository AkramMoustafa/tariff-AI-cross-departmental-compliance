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
import { autoClassify1, improveDescription1 } from "@/api/tariffClient";
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
  isCollapsed: boolean;
  suggestedHSCode: string;
  suggestedHSDescription: string; // add this
  confirmedHSCode: string;
  descriptionConfidence: "LOW" | "MEDIUM" | "HIGH";
  hsConfidence: "LOW" | "MEDIUM" | "HIGH";
  alternatives?: { code: string; description: string }[];
};
const baseButton = {
  textTransform: "none",
  borderRadius: "12px",
  fontWeight: 600,
  px: 2.25,
  py: 1.1,
  fontSize: 13,
  minHeight: 44,
  boxShadow: "none",
};
const primaryButton = {
  ...baseButton,
  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
  color: "#fff",
  "&:hover": {
    background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.22)",
  },
};


const secondaryButton = {
  ...baseButton,
  border: "1px solid #cbd5e1",
  color: "#0f172a",
  backgroundColor: "#ffffff",
  "&:hover": {
    borderColor: "#94a3b8",
    backgroundColor: "#f8fafc",
  },
};


const successButton = {
  ...baseButton,
  background: "#16a34a",
  color: "#fff",
  "&:hover": {
    background: "#15803d",
    boxShadow: "0 8px 18px rgba(22, 163, 74, 0.22)",
  },
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
  if (lineItems.length > 0) {
    setTimeout(() => {
      document.getElementById("product-validation")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 200);
  }
}, [lineItems]);

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
        isCollapsed: existing?.isCollapsed || false,
        quantity: item.quantity || "",
        unitPrice: item.unitPrice || "",

        suggestedHSCode: existing?.suggestedHSCode || item.hsCode || "",
        suggestedHSDescription: existing?.suggestedHSDescription || "", // add this
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

const [items, setItems] = useState<EditableLineItem[]>([]);
const [showTariff, setShowTariff] = useState(false);
const handleConfirm = (index: number) => {
  setItems(prev =>
    prev.map((item, i) => {
      if (i !== index) return item;

      return {
        ...item,
        isCollapsed: true, // 🔥 THIS collapses the card
      };
    })
  );
};
const handleImproveDescription = async (index: number) => {
  const item = items[index];

  const sourceDescription =
    item.suggestedHSDescription || item.improvedDescription;

  if (!sourceDescription.trim()) {
    alert("No description available");
    return;
  }

  try {
    const res = await improveDescription1({
      description: sourceDescription,
    });

    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;

        return {
          ...it,
          improvedDescription: res.description,  // 🔥 THIS is the key
          descriptionConfidence: getDescriptionConfidence(res.description),
        };
      })
    );
  } catch (err) {
    console.error("Improve description failed", err);
  }
};
const handleClassifyHS = async (index: number) => {
  const item = items[index];

  if (!item.improvedDescription.trim()) {
    alert("Add description first");
    return;
  }

  try {
    const res = await autoClassify1({
     description: item.suggestedHSDescription || item.improvedDescription,
    });

    console.log("API RESULT:", res);

    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;

    return {
      ...it,
      improvedDescription: it.improvedDescription,

      suggestedHSCode: res.suggested?.code || "",

      // keep for internal use if needed
      suggestedHSDescription:
        res.suggested?.description ||
        res.hs_description ||
        "",

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
      description: item.originalDescription,   // ✅ FIX
      normalizedDescription: item.improvedDescription,  // ✅ ADD THIS
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
        p: 3,
        borderRadius: "18px",
        border: "1px solid #e5e7eb",
         
       overflow: "hidden" ,        
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
        mb: 4,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
          Review & Confirm Product Classification
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.5 }}>
          Improve product descriptions, run AI classification, and confirm HS
          codes before tariff analysis.
        </Typography>
      </Box>

      <Stack spacing={3}>
{items.map((item, index) =>
  item.isCollapsed ? (

    // ✅ COLLAPSED VIEW (ONLY GREEN BOX)
    <Box key={index}>
      <Box
        sx={{
          p: 2,
          borderRadius: "12px",
          backgroundColor: "#ecfdf5",
          border: "1px solid #bbf7d0",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          ✅ HS Code Confirmed: {item.confirmedHSCode}
        </Typography>

        <Typography sx={{ fontSize: 12, color: "#065f46", mt: 0.5 }}>
          {item.improvedDescription}
        </Typography>

        <Button
          size="small"
          sx={{ mt: 1 }}
          onClick={() =>
            setItems(prev =>
              prev.map((it, i) =>
                i === index ? { ...it, isCollapsed: false } : it
              )
            )
          }
        >
          Edit
        </Button>
      </Box>
    </Box>

  ) : (

    // 🔵 EXPANDED VIEW (FULL CARD)
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
                gap: 1,
                mb: 1.5,
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

              <Grid item xs={12}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mb: 0.5 }}
                >
                <Button
                  variant="outlined"
                  onClick={() => handleImproveDescription(index)}
                  sx={secondaryButton}
                >
                  ✨ Improve Description
                </Button>

                <Button
                  variant="contained"
                  onClick={() => handleClassifyHS(index)}
                  sx={primaryButton}
                >
                  Classify HS Code
                </Button>
                </Stack>
              </Grid>

            </Box>
            {!item.isCollapsed ? (
          <Grid container spacing={2.5} alignItems="stretch">
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  height: 90,
                  overflow: "hidden",
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


              <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Improved Description"
                value={item.improvedDescription}
                onChange={(e) =>
                  handleFieldChange(index, "improvedDescription", e.target.value)
                }
                sx={{
                  ...inputSx,
                  "& .MuiOutlinedInput-root": {
                    ...inputSx["& .MuiOutlinedInput-root"],
                    height: 90,              // ✅ correct placement
                    alignItems: "flex-start"
                  },
                  "& textarea": {
                    overflow: "auto"
                  }
                }}
                helperText="Use a precise commercial description with product type, material, and intended use."
              />
              </Grid>
                    
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                
                  label="AI Suggested HS Code"
                  value={item.suggestedHSCode}
                  InputProps={{ readOnly: true }}
                  sx={inputSx }
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
                            {item.alternatives && item.alternatives.length > 0 && (
            
            <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>
                    Alternative Classifications
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={
                      item.confirmedHSCode
                        ? "✅ Verified"
                        : "⚠️ Needs Review"
                    }
                    color={item.confirmedHSCode ? "success" : "warning"}
                    size="small"
                  />
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
            

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
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
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button
                    variant="contained"
                    sx={successButton}
                    onClick={() => handleConfirm(index)}
                    disabled={!item.confirmedHSCode}
                  >
                    Confirm Classification
                  </Button>
                </Box>
              </Grid>
            </Grid>
            ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #bbf7d0",
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                ✅ HS Code Confirmed: {item.confirmedHSCode}
              </Typography>

              <Typography sx={{ fontSize: 12, color: "#065f46", mt: 0.5 }}>
                {item.improvedDescription}
              </Typography>

              <Button
                size="small"
                sx={{ mt: 1, textTransform: "none" }}
                onClick={() =>
                  setItems(prev =>
                    prev.map((it, i) =>
                      i === index ? { ...it, isCollapsed: false } : it
                    )
                  )
                }
              >
                Edit
              </Button>
            </Box>
      )}
          </Box>
        ))}
      </Stack>

    
    </Paper>
  );
};

export default ProductValidationCard;