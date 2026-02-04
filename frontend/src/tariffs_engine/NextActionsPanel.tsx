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
  iconBg = "#f3f4f6",
  iconColor = "#374151",
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
      bgcolor: disabled ? "transparent" : "#f9fafb",
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
        <Typography fontSize={13} fontWeight={600}>
          {title}
        </Typography>
        <Typography fontSize={11.5} color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {/* RIGHT ICON */}
      {rightIcon && (
        <Box sx={{ color: "#9ca3af", flexShrink: 0 }}>
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
      sx={{
        p: 2.5,
        borderRadius: 1,
        border: "1px solid #e5e7eb",
        bgcolor: "#ffffff",
      }}
    >
      <Stack spacing={2}>
        {/* NEXT ACTIONS */}
        <Box>
          <Typography fontSize={11} fontWeight={600} color="#9ca3af" mb={1}>
            NEXT ACTIONS
          </Typography>

          <Stack spacing={0.5}>
            <Box sx={{ border: "1px solid #e5e7eb", pt: 0.5, borderRadius: 1 }}>
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

            <Box sx={{ border: "1px solid #e5e7eb", pt: 0.5, borderRadius: 1 }}>
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

            <Box sx={{ border: "1px solid #e5e7eb", pt: 0.5, borderRadius: 1 }}>
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

        <Divider sx={{ borderColor: "#e5e7eb" }} />

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