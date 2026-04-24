import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
} from "@mui/material";
import { calculateDuty } from "@/api/tariffClient";
import { COUNTRIES } from "@/constants/countries";

const metricBox = {
  p: 2,
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f8fafc",
};
const normalizeCountry = (value: string) => {
  if (!value) return "";

  // Already ISO code
  if (value.length === 2) return value.toUpperCase();

  // Match full name → code
  const match = COUNTRIES.find(
    c => c.name.toLowerCase() === value.toLowerCase()
  );

  return match ? match.code : "";
};
const itemBox = {
  p: 2,
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  mb: 2,
};

type LineItem = {
  description: string;
  normalizedDescription?: string;
  quantity: string;
  unitPrice: string;
  hsCode?: string;
};

type Props = {
  items: LineItem[];
  origin: string;   // ✅ ADD THIS
};
const StaticDecisionCard = ({ items, origin }: Props) => {
  const [results, setResults] = useState<any[]>([]);
const normalizedOrigin = normalizeCountry(origin);

  useEffect(() => {
    const runCalculations = async () => {
      const newResults = await Promise.all(
        items.map(async (item) => {
        const customsValue =
            Number(item.quantity || 0) * Number(item.unitPrice || 0);

        if (!item.hsCode || !normalizedOrigin || customsValue <= 0) {
            return null;
        }

        try {
            const res = await calculateDuty({
            hs_code: item.hsCode,
            origin_country: normalizedOrigin,
            customs_value: customsValue,
            freight: 0,
            insurance: 0,
            });

            return res;
        } catch (err) {
            console.error("Tariff calc failed", err);
            return null;
        }
        })
      );

      setResults(newResults);
    };

    if (items.length > 0) {
      runCalculations();
    }
}, [items, normalizedOrigin]);
const totalTariffs = results.reduce((sum, r) => {
  return sum + (r?.duty_payable?.total_duty_payable || 0);
}, 0);

const totalGoodsValue = items.reduce((sum, item) => {
  return sum + Number(item.quantity || 0) * Number(item.unitPrice || 0);
}, 0);

const landedCost = totalGoodsValue + totalTariffs;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        mt: 4,
      }}
    >
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Decision Summary
        </Typography>

        <Typography sx={{ fontSize: 13, color: "#64748b" }}>
          Financial impact and risk for this purchase order
        </Typography>
      </Box>

      {/* METRICS (unchanged static for now) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Box sx={metricBox}>
           <Typography fontSize={16} fontWeight={700}>Total Tariffs</Typography>
            <Typography fontWeight={700}>
  ${totalTariffs.toLocaleString()}
</Typography>
          </Box>
        </Grid>

        <Grid item xs={6} md={3}>
          <Box sx={metricBox}>
           <Typography fontSize={16} fontWeight={700}>Landed Cost</Typography>
            <Typography fontWeight={700}>
  ${landedCost.toLocaleString()}
</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* PRODUCT BREAKDOWN */}
      <Box>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>
          Product Breakdown
        </Typography>

        {items.map((item, index) => (
          <Box key={index} sx={itemBox}>
            <Typography fontWeight={600}>
              {item.normalizedDescription || item.description}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>

              </Grid>

              <Grid item xs={6} md={3}>

              </Grid>

              <Grid item xs={6} md={3}>

              </Grid>
            </Grid>

<Box sx={{ mt: 1 }}>
  {(() => {
    const r = results[index];

    return (
      <>
       <Typography fontSize={16} fontWeight={700}>
          HS Code: {item.hsCode || "Not available"}
        </Typography>

        {/* 🔹 HS Hierarchy */}
        {r?.product?.hierarchy && (
          <Typography fontSize={11} color="#64748b">
            {r.product.hierarchy.map((h: any) => h.hs_code).join(" → ")}
          </Typography>
        )}

      <Typography fontSize={16} fontWeight={700}>
          Tariff:{" "}
          {r
            ? `${r.calculated_duties.total_rate_percent.toFixed(2)}%`
            : "--"}
        </Typography>

      <Typography fontSize={16} fontWeight={700}>
          Duty:{" "}
          {r
            ? `$${r.duty_payable.total_duty_payable.toFixed(2)}`
            : "--"}
        </Typography>

        {/* 🔹 Base vs Additional */}
       <Typography fontSize={16} fontWeight={700}>
          Base: {r?.calculated_duties.base_rate_percent ?? "--"}%
        </Typography>

        {r?.calculated_duties.section301_rate_percent > 0 && (
         <Typography fontSize={16} fontWeight={700}>
            Section 301: {r?.calculated_duties.section301_rate_percent ?? "--"}%
            </Typography>
        )}

        {/* 🔹 Section 301 */}
        {r?.section_301?.applies && (
        <Typography fontSize={12} color="#dc2626">
            Section 301 applied
        </Typography>
        )}

        {/* 🔹 Chapter 99 */}
        {r?.chapter_99 && (
        <Typography fontSize={12} color="#64748b">
        Chapter 99: {r.chapter_99.heading} (legal classification)
        </Typography>
        )}
      </>
    );
  })()}
</Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default StaticDecisionCard;