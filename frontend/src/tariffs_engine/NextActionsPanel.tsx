import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AlertTriangle, Truck, Download, Bookmark, CheckCircle2 } from "lucide-react";
  interface NextActionsPanelProps {
  canExportPdf: boolean;
  onExportPdf: () => void;
  onFindSuppliers?: () => void;
  onSaveCalculation?: () => void;
}
function ActionRow({
  icon,
  title,
  subtitle,
  rightIcon,
  onClick,
  disabled = false,
iconBg = "rgba(16, 52, 166, 0.05)",
iconColor = "#1034A6",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  iconBg?: string;
  iconColor?: string;
}) {

  return (
<Box
  onClick={!disabled && onClick ? onClick : undefined}
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    p: 1.25,
    borderRadius: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    "&:hover": {
     bgcolor: disabled ? "transparent" : "#f8fafc",
    },
  }}
>
      {/* LEFT ICON */}
<Box
  sx={{
    width: 36,
    height: 36,
    borderRadius: 1,
    bgcolor: iconBg,
    color: iconColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }}
>
        {icon}
      </Box>

      {/* TEXT */}
      <Box sx={{ flex: 1 }}>
     <Typography
  sx={{
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#2C3E50",
  }}
>
          {title}
        </Typography>
        <Typography fontSize={11.5} color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {/* RIGHT ICON */}
      {rightIcon && (
        <Box sx={{ color: "#94a3b8", flexShrink: 0 }}>
          {rightIcon}
        </Box>
      )}
    </Box>
  );
}

export default function NextActionsPanel({
  canExportPdf,
  onExportPdf,
  onFindSuppliers,
  onSaveCalculation,
}: NextActionsPanelProps) {
  return (
<Paper
  elevation={0}
  sx={{
    p: 3,
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    bgcolor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    },
  }}
>
      <Stack spacing={2}>
        {/* NEXT ACTIONS */}
        <Box>
         <Typography
  sx={{
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#64748b",
    letterSpacing: "0.08em",
  }}
  mb={1}
>
            NEXT ACTIONS
          </Typography>

          <Stack spacing={0.5}>
            <Box sx={{ border: "1px solid #e2e8f0", pt: 0.5, borderRadius: 1 }}>
<ActionRow
  icon={<Truck size={18} strokeWidth={1.75} />}
  title="Find Suppliers"
  subtitle="Source this HS Code"
  rightIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
  iconBg="rgba(37, 99, 235, 0.12)"
  iconColor="#2563eb"
  onClick={onFindSuppliers}
/>
            </Box>

            <Box sx={{ border: "1px solid #e2e8f0", pt: 0.5, borderRadius: 1 }}>
            <ActionRow
              icon={<Download size={18} strokeWidth={1.75} />}
              title="Export Report"
              subtitle={
                canExportPdf
                  ? "Download PDF summary"
                  : "Upgrade to Perform to enable PDF export"
              }
              rightIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
              onClick={onExportPdf}
              disabled={!canExportPdf}
            />
            </Box>

            <Box sx={{ border: "1px solid #e2e8f0", pt: 0.5, borderRadius: 1 }}>
            <ActionRow
              icon={<Bookmark size={18} strokeWidth={1.75} />}
              title="Save Calculation"
              subtitle="Add to compliance log"
              rightIcon={<CheckCircle2 size={14} strokeWidth={2} />}
              onClick={onSaveCalculation}
            />
            </Box>
          </Stack>
        </Box>

   <Divider sx={{ borderColor: "#e2e8f0" }} />
        {/* COMPLIANCE ALERT */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,

            border: "1px solid #fde68a",
            bgcolor: "#fffbeb",
            width: "300px",
          }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                bgcolor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={12} strokeWidth={1.75} color="#f59e0b" />
            </Box>

            <Typography fontSize={11} fontWeight={600}>
              Compliance Alerts
            </Typography>
          </Stack>

          <Chip
            label="Section 301 Investigation"
            size="small"
            sx={{
              mb: 1,
              bgcolor: "#fef3c7",
              color: "#92400e",
              fontSize: 10,
              fontWeight: 500,
            }}
          />

          <Typography fontSize={10} color="text.secondary">
            Product may be subject to additional duties if originating from China
            under List 1–4. Verify exclusions.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}