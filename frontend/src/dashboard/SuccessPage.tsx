import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #f8fafc 100%)",
      }}
    >
      {/* 🔥 Background glow (matches your contact page) */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.12)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -120,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(16,52,166,0.10)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      {/* 🔥 Card */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 640,
          width: "100%",
          p: { xs: 4, md: 6 },
          borderRadius: "28px",
          textAlign: "center",
          backdropFilter: "blur(18px)",
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(226,232,240,0.9)",
          boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
        }}
      >
        <Stack spacing={3} alignItems="center">
          
          {/* ✅ Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #1034A6 0%, #2563eb 100%)",
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(37,99,235,0.25)",
            }}
          >
            ✓
          </Box>

          {/* 🔥 Headline */}
          <Typography
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#0f172a",
              lineHeight: 1.1,
            }}
          >
            Request Successfully Submitted
          </Typography>

          {/* 💡 Main message */}
          <Typography
            sx={{
              fontSize: "1rem",
              color: "#64748b",
              lineHeight: 1.8,
              maxWidth: 500,
            }}
          >
            We’ve received your request and will reach out shortly to understand
            your procurement workflows and discuss how we can help you reduce
            tariff exposure and supplier risk.
          </Typography>

          {/* 🚀 Highlight box */}
          <Box
            sx={{
              mt: 1,
              px: 3,
              py: 2,
              borderRadius: "16px",
              background:
                "linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(255,255,255,0.95) 100%)",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography
              sx={{
                fontSize: 13.5,
                color: "#475569",
                lineHeight: 1.7,
              }}
            >
              Typical response time: <b>within 24 hours</b>
            </Typography>
          </Box>

          {/* 🎯 Actions */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
            <Button
              onClick={() => navigate("/")}
              sx={{
                height: 48,
                px: 4,
                borderRadius: "14px",
                fontWeight: 600,
                textTransform: "none",
                background:
                  "linear-gradient(135deg, #1034A6 0%, #2563eb 100%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0b2f97 0%, #1d4ed8 100%)",
                },
              }}
            >
              Back to Home
            </Button>


          </Stack>

          {/* subtle footer */}
          <Typography
            sx={{
              mt: 2,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            You can safely close this page at any time
          </Typography>

        </Stack>
      </Paper>
    </Box>
  );
}