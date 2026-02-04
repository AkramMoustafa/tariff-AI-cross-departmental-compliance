import { Box, Typography, Stack, Divider, keyframes } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

/* Animations */
const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const stagger = (i: number) => ({
  animation: `${fadeUp} 420ms ease-out`,
  animationDelay: `${i * 80}ms`,
  animationFillMode: "both",
});

export default function SystemStatusPanel() {
  return (
    <Box
      sx={{
        mt: 4,
        pl: 2,
        borderLeft: "2px solid #e2e8f0",
        maxWidth: 520,
        animation: `${fadeUp} 360ms ease-out`,
      }}
    >
      {/* Header */}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "#64748b",
          mb: 1,
        }}
      >
        SYSTEM STATUS
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* 1 x 2 layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 3,
        }}
      >
        {/* Left column */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              mb: 1,
              ...stagger(0),
            }}
          >
            <CheckCircleRoundedIcon
              sx={{ fontSize: 18, color: "#16a34a" }}
            />
            <Typography
              sx={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}
            >
              All systems operational
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 11,
              color: "#94a3b8",
              ...stagger(1),
            }}
          >
            Production environment healthy
          </Typography>
        </Box>

        {/* Right column */}
        <Stack spacing={1}>
          {[
            "Rules engine up to date",
            "Audit trail integrity verified",
            "12,418 calculations today",
            "No compliance alerts",
          ].map((text, i) => (
            <StatusLine key={text} text={text} index={i + 2} />
          ))}
        </Stack>
      </Box>

      {/* Microcopy */}
      <Typography
        sx={{
          mt: 2,
          fontSize: 11,
          color: "#94a3b8",
          ...stagger(6),
        }}
      >
        Status reflects current production environment
      </Typography>
    </Box>
  );
}

function StatusLine({
  text,
  index,
}: {
  text: string;
  index: number;
}) {
  return (
    <Typography
      sx={{
        fontSize: 13,
        color: "#334155",
        pl: 3.5,
        position: "relative",
        ...stagger(index),
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 8,
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: "#16a34a",
        },
      }}
    >
      {text}
    </Typography>
  );
}
