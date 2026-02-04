import { Box, Typography, Stack } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalculateIcon from "@mui/icons-material/Calculate";
import HistoryIcon from "@mui/icons-material/History";

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: 180,
        // I added minHeight: "100vh" instead of "relative" because without it the sidebar height was only as tall as its content. -- This was the only Change I made.
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
        <NavItem icon={<DashboardIcon />} label="Dashboard" />
        <NavItem
          icon={<CalculateIcon />}
          label="Tariff Calculator"
          active
        />
        <NavItem icon={<HistoryIcon />} label="History" />
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
  active,
  disabled,
}: {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.6,                   // 👈 tighter height
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
      {icon && (
        <Box sx={{ fontSize: 16, opacity: 0.9 }}>
          {icon}
        </Box>
      )}

      <Typography sx={{ fontSize: 13 }}>
        {label}
      </Typography>
    </Box>
  );
}