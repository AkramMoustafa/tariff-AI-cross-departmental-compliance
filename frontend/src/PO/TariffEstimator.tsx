/**
 * TariffEstimator.tsx
 *
 * Renders a "Decision Summary" card for a Purchase Order review.
 * For each line item it calls calculateDuty() and displays:
 *   - HS code + hierarchy breadcrumb
 *   - Applicable tariff rate (base + Section 301 if any)
 *   - Duty amount and total landed cost
 *
 * Props:
 *   items  – parsed PO line items (description, qty, unit price, HS code)
 *   origin – supplier country as an ISO-3166-1 alpha-2 code or full name
 */
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

// ── Shared style tokens ──────────────────────────────────────────────────────

/** Card used for the top-level summary metrics (Total Tariffs, Landed Cost). */
const metricBox = {
  p: 2,
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f8fafc",
};

/** Card wrapping each individual line-item breakdown. */
const itemBox = {
  p: 2,
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  mb: 2,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a supplier country value to an ISO-3166-1 alpha-2 code.
 * Accepts either a 2-letter code (returned as-is, uppercased) or a full
 * country name looked up against the COUNTRIES constant list.
 * Returns an empty string if no match is found.
 */
const normalizeCountry = (value: string): string => {
  if (!value) return "";

  // Already a valid ISO alpha-2 code — just normalise the case.
  if (value.length === 2) return value.toUpperCase();

  // Full country name → look up the corresponding ISO code.
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === value.toLowerCase()
  );

  return match ? match.code : "";
};

// ── Types ────────────────────────────────────────────────────────────────────

type LineItem = {
  description: string;
  /** AI-normalised product description used for display when available. */
  normalizedDescription?: string;
  quantity: string;
  unitPrice: string;
  hsCode?: string;
};

type Props = {
  items: LineItem[];
  /** Supplier country — accepts an ISO alpha-2 code or a full country name. */
  origin: string;
};

// ── Component ────────────────────────────────────────────────────────────────

const StaticDecisionCard = ({ items, origin }: Props) => {
  const [results, setResults] = useState<any[]>([]);

  // Normalise once so it is stable across renders and the effect dependency.
  const normalizedOrigin = normalizeCountry(origin);

  // Recalculate duties whenever the line items or origin country change.
  useEffect(() => {
    const runCalculations = async () => {
      const newResults = await Promise.all(
        items.map(async (item) => {
          const customsValue =
            Number(item.quantity || 0) * Number(item.unitPrice || 0);

          // Skip items that are missing the HS code, origin, or a positive value.
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

  // ── Derived totals ─────────────────────────────────────────────────────────

  /** Sum of all duty amounts across every line item. */
  const totalTariffs = results.reduce(
    (sum, r) => sum + (r?.duty_payable?.total_duty_payable || 0),
    0
  );

  /** Sum of (quantity × unit price) for all line items. */
  const totalGoodsValue = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );

  /** Goods value plus all applicable tariffs. */
  const landedCost = totalGoodsValue + totalTariffs;

  // ── Render ─────────────────────────────────────────────────────────────────

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
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Decision Summary
        </Typography>

        <Typography sx={{ fontSize: 13, color: "#64748b" }}>
          Financial impact and risk for this purchase order
        </Typography>
      </Box>

      {/* Top-level metrics: Total Tariffs and Landed Cost */}
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

      {/* Per-line-item breakdown */}
      <Box>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>
          Product Breakdown
        </Typography>

        {items.map((item, index) => (
          <Box key={index} sx={itemBox}>
            {/* Use the AI-normalised description when available. */}
            <Typography fontWeight={600}>
              {item.normalizedDescription || item.description}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3} />
              <Grid item xs={6} md={3} />
              <Grid item xs={6} md={3} />
            </Grid>

            {/* Tariff details for this line item */}
            <Box sx={{ mt: 1 }}>
              {(() => {
                const r = results[index];

                return (
                  <>
                    {/* HS code assigned to this product */}
                    <Typography fontSize={16} fontWeight={700}>
                      HS Code: {item.hsCode || "Not available"}
                    </Typography>

                    {/* Breadcrumb trail through the HS hierarchy (e.g. 84 → 8457 → 845710) */}
                    {r?.product?.hierarchy && (
                      <Typography fontSize={11} color="#64748b">
                        {r.product.hierarchy
                          .map((h: any) => h.hs_code)
                          .join(" → ")}
                      </Typography>
                    )}

                    {/* Effective (combined) tariff rate */}
                    <Typography fontSize={16} fontWeight={700}>
                      Tariff:{" "}
                      {r
                        ? `${r.calculated_duties.total_rate_percent.toFixed(2)}%`
                        : "--"}
                    </Typography>

                    {/* Total duty amount in USD */}
                    <Typography fontSize={16} fontWeight={700}>
                      Duty:{" "}
                      {r
                        ? `$${r.duty_payable.total_duty_payable.toFixed(2)}`
                        : "--"}
                    </Typography>

                    {/* MFN base rate before any additional tariffs */}
                    <Typography fontSize={16} fontWeight={700}>
                      Base: {r?.calculated_duties.base_rate_percent ?? "--"}%
                    </Typography>

                    {/* Section 301 surcharge (China-origin goods) — only shown when non-zero */}
                    {r?.calculated_duties.section301_rate_percent > 0 && (
                      <Typography fontSize={16} fontWeight={700}>
                        Section 301:{" "}
                        {r?.calculated_duties.section301_rate_percent ?? "--"}%
                      </Typography>
                    )}

                    {/* Confirmation badge when Section 301 was applied */}
                    {r?.section_301?.applies && (
                      <Typography fontSize={12} color="#dc2626">
                        Section 301 applied
                      </Typography>
                    )}

                    {/* Chapter 99 special provision heading, if present */}
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
