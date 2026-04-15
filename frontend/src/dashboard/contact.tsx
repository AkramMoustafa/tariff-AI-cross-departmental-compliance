import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SystemStatusPanel from "./SystemStatusPanel";
import { submitContact } from "@/api/client"; // or correct path
export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const navigate = useNavigate();

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "#ffffff",
      fontSize: 14,
      transition: "all 0.2s ease",
      "& fieldset": {
        borderColor: "#e2e8f0",
      },
      "&:hover fieldset": {
        borderColor: "#cbd5e1",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 4px rgba(37,99,235,0.08)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2563eb",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: 13,
      color: "#64748b",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#2563eb",
    },
  };
const handleSend = async () => {
  try {
    await submitContact({
      name: form.name,
      email: form.email,
      company: form.company,
      message: form.message,
    });

    alert("Request sent successfully");

    setForm({
      name: "",
      email: "",
      company: "",
      message: "",
    });
    navigate("/success"); 
  } catch (err) {
    console.error(err);
    alert("Failed to send");
  }
};
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, md: 6 },
        background:
          "linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #f8fafc 100%)",
      }}
    >
      {/* soft background glow */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.10)",
          filter: "blur(70px)",
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
          background: "rgba(16,52,166,0.08)",
          filter: "blur(70px)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          width: "100%",
          maxWidth: 1120,
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          gap: { xs: 2.5, md: 4 },
          alignItems: "stretch",
        }}
      >
        {/* LEFT SIDE */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "28px",
            p: { xs: 3, sm: 4, md: 5 },
            bgcolor: "rgba(255,255,255,0.68)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(226,232,240,0.9)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
          }}
        >
          <Box>


            <Typography
              sx={{
                fontSize: { xs: 28, sm: 34, md: 40 },
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                color: "#0f172a",
                maxWidth: 560,
              }}
            >
              Become an early pilot for smarter tariff and supplier decisions.
            </Typography>

            <Typography
              sx={{
                fontSize: "1rem",
                color: "#64748b",
                lineHeight: 1.75,
                mt: 2,
                maxWidth: 540,
              }}
            >
              Validate purchase decisions before approval with tariff checks,
              supplier risk visibility, and financial exposure insights.
            </Typography>

            <Box
              sx={{
                mt: 3,
                p: 2.25,
                borderRadius: "18px",
                background:
                  "linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,0.95) 100%)",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a", mb: 1 }}
              >
                Why teams join early
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: "#475569", lineHeight: 1.8 }}>
                • Validate tariffs before orders are approved
                <br />
                • Compare supplier risk before committing spend
                <br />
                • Understand cost exposure from delays and trade changes
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <SystemStatusPanel />
            </Box>
          </Box>
        </Paper>

        {/* RIGHT SIDE */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "28px",
            p: { xs: 3, sm: 4 },
            bgcolor: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(226,232,240,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                display: "inline-flex",
                px: 1.4,
                py: 0.7,
                borderRadius: "999px",
                bgcolor: "#eff6ff",
                color: "#1d4ed8",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
                mb: 1.5,
              }}
            >
              EARLY ACCESS
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 24, sm: 28 },
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              Apply for the pilot
            </Typography>

            <Typography
              sx={{
                fontSize: "0.96rem",
                color: "#64748b",
                lineHeight: 1.7,
                mt: 1,
                maxWidth: 460,
              }}
            >
              We are onboarding a limited number of manufacturers to test
              real-time tariff validation, supplier risk scoring, and financial
              exposure analysis.
            </Typography>
          </Box>

          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: "16px",
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a", mb: 0.5 }}
            >
              Best fit for teams that need:
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
              Faster PO review, clearer tariff exposure, and better visibility
              into supplier and trade risk.
            </Typography>
          </Box>

          <Stack spacing={2}>
            <TextField
              label="Your Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={inputSx}
            />

            <TextField
              label="Work Email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={inputSx}
            />

            <TextField
              label="Company Name"
              fullWidth
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              sx={inputSx}
            />

            <TextField
              label="What are you trying to solve?"
              multiline
              rows={4}
              fullWidth
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              sx={inputSx}
            />

            <Button
              variant="contained"
              onClick={handleSend}
              sx={{
                mt: 0.5,
                height: 50,
                textTransform: "none",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                background:
                  "linear-gradient(135deg, #1034A6 0%, #2563eb 100%)",
                borderRadius: "14px",
              
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0b2f97 0%, #1d4ed8 100%)",
                
                },
              }}
            >
              Request Early Access
            </Button>
          </Stack>

          <Typography
            sx={{
              fontSize: 12,
              color: "#94a3b8",
              textAlign: "center",
              mt: 1.5,
              lineHeight: 1.6,
            }}
          >
            Limited pilot spots available for qualified teams
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}