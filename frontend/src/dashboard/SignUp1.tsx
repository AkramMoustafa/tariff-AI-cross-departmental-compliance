import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Divider,
  Paper,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SystemStatusPanel from "./SystemStatusPanel";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";
import Alert from "@mui/material/Alert";

import { signupClientUser } from "@/api/apiClientAuth";

export default function Login() {
const handleGoToLogin = () => {
  navigate("/signin");
};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate();

const handleSignUp = async () => {
  setError("");

  if (!email || !password || !confirmPassword) {
    setError("All fields are required.");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    await signupClientUser({
      email,
      password,
    });

    // client_user_token stored internally
    navigate("/tariffs");
  } catch (err: any) {
    setError(err.message || "Failed to create account");
  } finally {
    setLoading(false);
  }
};

  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#ffffff",
        position: "relative",
        
        overflow: "hidden",
        px: { xs: 2, sm: 3 },
      }}
    >

      {/* Content wrapper */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1040,
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          gap: { xs: 2.5, md: 3.5 },
          alignItems: "stretch",
        }}
      >
        {/* Left: Brand / Identity panel */}
       <Paper
  elevation={0}
  sx={{
    borderRadius: "20px",
    p: { xs: 3, sm: 4, md: 5 },
    bgcolor: "transparent",  
justifyContent: "flex-start",
gap: 4,
    display: "flex",
    flexDirection: "column",

  }}
>


          <Box sx={{ position: "relative", zIndex: 2 }}>
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                mb: 3,
                mt: -1.5,
              }}
            >


              <Box>
              <Typography sx={{ color: "#0f172a", fontWeight: 600, letterSpacing: "-0.02em" }}>
                NOMIAI
              </Typography>

              <Typography sx={{ color: "#64748b", fontSize: 12 }}>
                Compliance Intelligence Platform
              </Typography>
              </Box>
            </Box>

            {/* Headline */}
          <Typography
            sx={{
            fontSize: { xs: 22, sm: 26, md: 30 },
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.25,
            color: "#2C3E50",
            }}
          >
            Sign Up
          </Typography>

        <Typography
          sx={{
fontSize: "0.95rem",
color: "#64748b",
lineHeight: 1.65,
          }}
        >
          Trusted duty calculations, audit-ready reporting, and cross-department accountability —
          all in one platform.
        </Typography>


            <SystemStatusPanel />
          </Box>


        </Paper>
{/* Vertical divider */}
<Box
  sx={{
    display: { xs: "none", md: "block" },
    position: "absolute",
    left: "50%",
    top: "8%",
    bottom: "8%",
    width: "1px",
    bgcolor: "#f0ebeb",
  }}
/>

        {/* Right: Login card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            p: { xs: 3, sm: 4 },
            bgcolor: "transparent",  

            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minHeight: { xs: "auto", md: 520 },
          }}
        >

          {/* Top meta */}
         <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              SIGN Up
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 22 },
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.25,
                color: "#2C3E50",
              }}
            >
              Welcome back
            </Typography>
            <Typography
              sx={{
                fontSize: "0.95rem",
                color: "#64748b",
                lineHeight: 1.65,
              }}
            >
              Choose how you’re signing in, then enter your credentials.
            </Typography>
          </Box>

       {/* Mode switch */}



          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Work email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
sx={{
  "& .MuiOutlinedInput-root": {
    height: 42,
    borderRadius: "10px",
    fontSize: 13.5,

    "& fieldset": {
      borderColor: "#e5e7eb",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
    },
  },

  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
    WebkitTextFillColor: "#0f172a",
    transition: "background-color 9999s ease-out 0s",
  },

  "& .MuiInputLabel-root": {
    fontSize: 12,
    color: "#64748b",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2563eb",
  },
}}

            />

            <TextField
              fullWidth
              label="Password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      sx={{ color: "#94a3b8" }}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
sx={{
  "& .MuiOutlinedInput-root": {
    height: 42,
    borderRadius: "10px",
    fontSize: 13.5,

    "& fieldset": {
      borderColor: "#e5e7eb",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
    },
  },

  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
    WebkitTextFillColor: "#0f172a",
    transition: "background-color 9999s ease-out 0s",
  },

  "& .MuiInputLabel-root": {
    fontSize: 12,
    color: "#64748b",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2563eb",
  },
}}

            />

            <TextField
              fullWidth
              label="Confirm password"
              placeholder="Confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      sx={{ color: "#94a3b8" }}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
sx={{
  "& .MuiOutlinedInput-root": {
    height: 42,
    borderRadius: "10px",
    fontSize: 13.5,

    "& fieldset": {
      borderColor: "#e5e7eb",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
    },
  },

  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
    WebkitTextFillColor: "#0f172a",
    transition: "background-color 9999s ease-out 0s",
  },

  "& .MuiInputLabel-root": {
    fontSize: 12,
    color: "#64748b",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2563eb",
  },
}}

            />

<Button
  fullWidth
  variant="contained"
  onClick={handleSignUp}
  disabled={loading}
  endIcon={<ArrowForwardRoundedIcon />}
  sx={{
    height: 42,
    textTransform: "none",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#fff",
    bgcolor: "#1034A6",
    borderRadius: "10px",
    boxShadow: "0 6px 14px rgba(16,52,166,0.18)",
    "&:hover": {
      bgcolor: "#003D82",
      boxShadow: "0 8px 18px rgba(16,52,166,0.22)",
    },
  }}
>
  {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
</Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 0.5,
              }}
            >


<Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
  Already have an account?{" "}
  <Typography
    onClick={handleGoToLogin}
    component="span"
    sx={{
      color: "#475569",
      fontWeight: 500,
      fontSize:14,
      cursor: "pointer",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
      "&:hover": { opacity: 0.8 },
    }}
  >
    Login
  </Typography>
</Typography>
            </Box>

            <Typography sx={{ fontSize: 11.5, color: "#94a3b8", mt: 1, lineHeight: 1.5 }}>
              By continuing, you agree to NOMIAI’s Terms and acknowledge the Privacy Policy.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
