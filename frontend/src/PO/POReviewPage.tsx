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
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { RiskDecision } from "@/PO/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const statusColors: Record<RiskDecision["approvalStatus"], { bg: string; color: string; border: string }> = {
  PENDING_REVIEW: { bg: "#fefce8", color: "#ca8a04", border: "#fef08a" },
  APPROVED:       { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  REJECTED:       { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  OVERRIDDEN:     { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  ESCALATED:      { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
};

function StatusBadge({ status }: { status: RiskDecision["approvalStatus"] }) {
  const s = statusColors[status];
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1.5,
        py: 0.5,
        borderRadius: "8px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {status.replace(/_/g, " ")}
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ py: 1, borderBottom: "1px solid #f1f5f9" }}>
      <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", mb: 0.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#0f172a", fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

const riskColor: Record<string, string> = {
  HIGH: "#dc2626", MEDIUM: "#d97706", LOW: "#15803d",
};

// ─── component ──────────────────────────────────────────────────────────────

export default function POReviewPage() {
  const navigate = useNavigate();
  const { state: nav } = useLocation() as {
    state: {
      poId: number | null;
      supplier: string;
      origin: string;
      destination: string;
      exposure: number;
      delay: number;
      riskLevel: "LOW" | "MEDIUM" | "HIGH";
      aiRecommendation: string;
      agentReasoning?: string;
      agentUrgency?: string;
    } | null;
  };

  const [decisionType, setDecisionType] = useState<"approve" | "modify" | "reject" | "escalate">( "approve");
  const [modifiedAction, setModifiedAction] = useState("");
  const [approverName, setApproverName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [auditRecord, setAuditRecord] = useState<RiskDecision | null>(null);

  if (!nav) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 8, textAlign: "center" }}>
        <Typography sx={{ fontSize: 16, color: "#64748b", mb: 3 }}>
          No PO data found. Please run a risk analysis first.
        </Typography>
        <Button
          onClick={() => navigate("/po")}
          sx={{ textTransform: "none", background: "linear-gradient(135deg, #1d4ed8, #2563eb)", color: "#fff", borderRadius: "12px", px: 3 }}
        >
          ← Back to Purchase Order
        </Button>
      </Box>
    );
  }

  const sectionCard = {
    p: 3,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  };

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

  const handleSubmit = (action: "approve" | "reject" | "escalate") => {
    const statusMap: Record<string, RiskDecision["approvalStatus"]> = {
      approve: decisionType === "modify" ? "OVERRIDDEN" : "APPROVED",
      reject: "REJECTED",
      escalate: "ESCALATED",
    };

    const record: RiskDecision = {
      poId: nav.poId != null ? String(nav.poId) : "—",
      predictedDelay: nav.delay,
      riskLevel: nav.riskLevel,
      aiRecommendation: nav.aiRecommendation,
      finalDecision: decisionType === "modify" ? modifiedAction : nav.aiRecommendation,
      approvalStatus: statusMap[action],
      approver: approverName || "Unknown",
      notes,
      createdAt: new Date().toISOString(),
    };

    const existing: RiskDecision[] = JSON.parse(localStorage.getItem("po_audit_trail") || "[]");
    existing.push(record);
    localStorage.setItem("po_audit_trail", JSON.stringify(existing));

    setAuditRecord(record);
    setSubmitted(true);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, mb: 8, px: 3 }}>

      {/* Page header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Button
          onClick={() => navigate("/po")}
          sx={{
            textTransform: "none",
            fontSize: 13,
            color: "#64748b",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            px: 2,
            "&:hover": { backgroundColor: "#f8fafc" },
          }}
        >
          ← Back
        </Button>
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#64748b" }}>
            Human-in-the-Loop
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
            Purchase Order Approval Review
          </Typography>
        </Box>
        <Box sx={{ ml: "auto" }}>
          <StatusBadge status={submitted && auditRecord ? auditRecord.approvalStatus : "PENDING_REVIEW"} />
        </Box>
      </Stack>

      <Grid container spacing={3}>

        {/* ── LEFT COLUMN ── */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>

            {/* PO Summary */}
            <Paper elevation={0} sx={sectionCard}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>PO Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={0}>
                <InfoRow label="PO Number" value={nav.poId != null ? `#${nav.poId}` : "—"} />
                <InfoRow label="Supplier"  value={nav.supplier || "—"} />
                <InfoRow label="Origin"    value={nav.origin || "—"} />
                <InfoRow label="Destination" value={nav.destination || "—"} />
                <InfoRow label="Financial Exposure" value={`$${nav.exposure.toLocaleString()}`} />
                <InfoRow label="Delay Prediction"   value={`${nav.delay} days`} />
                <InfoRow
                  label="Risk Level"
                  value={
                    <Box
                      sx={{
                        display: "inline-flex",
                        px: 1.5,
                        py: 0.3,
                        borderRadius: "6px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: riskColor[nav.riskLevel],
                        backgroundColor: `${riskColor[nav.riskLevel]}18`,
                      }}
                    >
                      {nav.riskLevel}
                    </Box>
                  }
                />
              </Stack>
            </Paper>

            {/* AI Recommendation */}
            <Paper elevation={0} sx={sectionCard}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>AI Recommendation</Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
                    <Typography sx={{ fontSize: 11, color: "#64748b" }}>Predicted Delay</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{nav.delay}d</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
                    <Typography sx={{ fontSize: 11, color: "#64748b" }}>Exposure</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>${(nav.exposure / 1000).toFixed(0)}k</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ p: 2, backgroundColor: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe", mb: nav.agentReasoning ? 2 : 0 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#1e40af", mb: 0.5 }}>Recommended Action</Typography>
                <Typography sx={{ fontSize: 13, color: "#1e3a8a", fontWeight: 600, textTransform: "capitalize" }}>
                  {(nav.aiRecommendation || "—").replace(/_/g, " ")}
                </Typography>
              </Box>

              {nav.agentReasoning && (
                <Box sx={{ p: 2, backgroundColor: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748b", mb: 0.5 }}>Agent Reasoning</Typography>
                  <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{nav.agentReasoning}</Typography>
                </Box>
              )}
            </Paper>

          </Stack>
        </Grid>

        {/* ── RIGHT COLUMN ── */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ ...sectionCard, height: "100%" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Human Decision</Typography>
            <Divider sx={{ mb: 3 }} />

            {!submitted ? (
              <Stack spacing={3}>

                {/* Approver name */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Approver Name</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Operations Manager"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    sx={inputSx}
                  />
                </Box>

                {/* Decision options */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Decision</Typography>
                  <RadioGroup
                    value={decisionType}
                    onChange={(e) => setDecisionType(e.target.value as typeof decisionType)}
                  >
                    {[
                      { value: "approve",  label: "Approve AI recommendation" },
                      { value: "modify",   label: "Modify recommendation" },
                      { value: "reject",   label: "Reject recommendation" },
                      { value: "escalate", label: "Escalate for further review" },
                    ].map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={<Radio size="small" sx={{ color: "#1d4ed8", "&.Mui-checked": { color: "#1d4ed8" } }} />}
                        label={<Typography sx={{ fontSize: 13 }}>{opt.label}</Typography>}
                        sx={{
                          mb: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "10px",
                          border: "1px solid",
                          borderColor: decisionType === opt.value ? "#bfdbfe" : "#f1f5f9",
                          backgroundColor: decisionType === opt.value ? "#eff6ff" : "transparent",
                          mx: 0,
                          transition: "all 0.15s",
                        }}
                      />
                    ))}
                  </RadioGroup>
                </Box>

                {/* Modified action field */}
                {decisionType === "modify" && (
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Modified Action</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Re-route via Atlantic route"
                      value={modifiedAction}
                      onChange={(e) => setModifiedAction(e.target.value)}
                      sx={inputSx}
                    />
                  </Box>
                )}

                {/* Notes */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Approver Notes</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Add context, justification, or instructions for the operations team..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={inputSx}
                  />
                </Box>

                {/* Action buttons */}
                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <Button
                    onClick={() => handleSubmit("approve")}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "12px",
                      py: 1.2,
                      background: "linear-gradient(135deg, #15803d, #16a34a)",
                      color: "#fff",
                      "&:hover": { background: "linear-gradient(135deg, #166534, #15803d)" },
                    }}
                  >
                    {decisionType === "modify" ? "Override & Approve" : "Approve"}
                  </Button>
                  <Button
                    onClick={() => handleSubmit("reject")}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "12px",
                      py: 1.2,
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      backgroundColor: "#fef2f2",
                      "&:hover": { backgroundColor: "#fee2e2" },
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleSubmit("escalate")}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "12px",
                      py: 1.2,
                      border: "1px solid #ddd6fe",
                      color: "#7c3aed",
                      backgroundColor: "#f5f3ff",
                      "&:hover": { backgroundColor: "#ede9fe" },
                    }}
                  >
                    Escalate
                  </Button>
                </Stack>

              </Stack>
            ) : (

              /* ── Audit trail ── */
              <Stack spacing={2}>
                <Box sx={{ p: 2, backgroundColor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#15803d", mb: 0.5 }}>
                    Decision recorded successfully
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#166534" }}>
                    This record has been saved to the audit trail.
                  </Typography>
                </Box>

                {auditRecord && (
                  <Paper elevation={0} sx={{ p: 3, borderRadius: "14px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 2 }}>Audit Trail</Typography>
                    <Stack spacing={1.5}>
                      <InfoRow label="AI Recommendation" value={(auditRecord.aiRecommendation || "—").replace(/_/g, " ")} />
                      <InfoRow label="Human Final Action" value={(auditRecord.finalDecision || "—").replace(/_/g, " ")} />
                      <InfoRow label="Status" value={<StatusBadge status={auditRecord.approvalStatus} />} />
                      <InfoRow label="Approved By" value={auditRecord.approver || "—"} />
                      {auditRecord.notes && <InfoRow label="Notes" value={auditRecord.notes} />}
                      <InfoRow
                        label="Timestamp"
                        value={new Date(auditRecord.createdAt).toLocaleString()}
                      />
                    </Stack>
                  </Paper>
                )}

                <Button
                  onClick={() => navigate("/po")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "12px",
                    py: 1.2,
                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    color: "#fff",
                    mt: 1,
                  }}
                >
                  ← Return to Purchase Orders
                </Button>
              </Stack>

            )}
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
