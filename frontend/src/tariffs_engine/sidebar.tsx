import { Box, Typography, Stack } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalculateIcon from "@mui/icons-material/Calculate";
import GavelIcon from "@mui/icons-material/Gavel";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: 180,
        minHeight: "100vh",
        position: "relative",
        bgcolor: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        px: 1.5,
        py: 2,
      }}
    >
      {/* CORE */}
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.08em",
          mb: 0.75,
        }}
      >
        CORE
      </Typography>

<Stack spacing={0.25} mb={2}>
  <NavItem
    icon={<GavelIcon />}
    label="tariffs"
    to="/tariffs"
  />

  <NavItem
    icon={<AssignmentIndIcon />}
    label="SupplierIntake"
    to="/SupplierIntake"
  />

  <NavItem
    icon={<ReceiptLongIcon />}
    label="po"
    to="/po"
  />
</Stack>

      {/* ROADMAP */}
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.08em",
          mb: 0.75,
        }}
      >
        ROADMAP
      </Typography>

      <Stack spacing={0.25}>
        <NavItem label="Sanctions" disabled />
        <NavItem label="Trade Rules" disabled />
        <NavItem label="Suppliers" disabled />
      </Stack>
    </Box>
  );
}
function NavItem({
  icon,
  label,
  to,
  disabled,
}: {
  icon?: React.ReactNode;
  label: string;
  to?: string;
  disabled?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
const active = to
  ? location.pathname.startsWith(to)
  : false;

  return (
    <Box
      onClick={() => !disabled && to && navigate(to)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.6,
        borderRadius: 0.75,
        cursor: disabled ? "default" : "pointer",
        fontSize: 13,
        fontWeight: 500,
        color: disabled
          ? "#cbd5e1"
          : active
          ? "#1d4ed8"
          : "#334155",
        bgcolor: active ? "rgba(29, 78, 216, 0.08)" : "transparent",
        borderLeft: active
          ? "2px solid #2563eb"
          : "2px solid transparent",
        "&:hover": {
          bgcolor: disabled ? "transparent" : "rgba(0,0,0,0.04)",
        },
      }}
    >
      {icon && <Box sx={{ fontSize: 16 }}>{icon}</Box>}
      <Typography sx={{ fontSize: 13 }}>{label}</Typography>
    </Box>
  );
}