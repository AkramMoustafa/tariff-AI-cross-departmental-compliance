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

export default function Login() {
  const handleGoToSignup = () => {
  navigate("/signup");
};
const rawEnvBase = import.meta.env.VITE_API_BASE_URL;
//  const [mode, setMode] = useState<"company" | "user">("company");
const mode = "user";
const BASE_URL =
  rawEnvBase && rawEnvBase.trim() !== ""
    ? rawEnvBase.trim()
    : window.location.hostname.includes("localhost")
    ? "http://localhost:8000"
    : "https://api.nomioc.com";

  const navigate = useNavigate();
  const { refreshSession } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
const handleLogin = async () => {
  setLoading(true);
  setError("");
  setSuccess("");

  // const endpoint =
  //   mode === "company"
  //     ? "/api/auth/login"
  //     : "/api/client-users/login-user";

  const endpoint = "/api/client-users/login-user";
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    if (!data.access_token) {
      throw new Error("Invalid login response");
    }

    // if (mode === "user") {
    //   // 🔑 CLIENT USER
    //   localStorage.setItem("client_user_token", data.access_token);
    //   localStorage.removeItem("access_token");
    // } else {
    //   // 🔑 CDC USER
    //   localStorage.setItem("access_token", data.access_token);
    //   localStorage.removeItem("client_user_token");
    // }

    // localStorage.setItem("login_type", mode);

    // setSuccess("Login successful");

    // if (mode === "company") {
    //   await refreshSession();
    //   navigate("/redirect", { replace: true });
    // } else {
    //   navigate("/tariffs", { replace: true });
    // }
    localStorage.setItem("client_user_token", data.access_token);
localStorage.removeItem("access_token");

setSuccess("Login successful");
navigate("/tariffs", { replace: true });
  } catch (err: any) {
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  const [showPassword, setShowPassword] = useState(false);

  
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
                AI Tariff & Trade Intelligence Platform
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
            Access your tariff operations platform.
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
              SIGN IN
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
             Sign in to access your account
            </Typography>
          </Box>

       {/* Mode switch */}
{/* <Box
  sx={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    p: 0.5,
    borderRadius: "999px",
    bgcolor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    mb: 2.5,
  }}
>
  <Button
    onClick={() => setMode("company")}
    startIcon={<BusinessRoundedIcon />}
    disableRipple
    sx={{
      height: 40,
      borderRadius: "999px",
      textTransform: "none",
      fontWeight: 600,
      fontSize: 13,
      gap: 0.75,
      color: mode === "company" ? "#0f172a" : "#64748b",
      bgcolor: mode === "company" ? "#ffffff" : "transparent",
      transition: "all 160ms ease",
      "&:hover": {
        bgcolor: mode === "company" ? "#ffffff" : "transparent",
      },
    }}
  >
    Enterprise Admin
  </Button>

  <Button
    onClick={() => setMode("user")}
    startIcon={<PersonOutlineRoundedIcon />}
    disableRipple
    sx={{
      height: 40,
      borderRadius: "999px",
      textTransform: "none",
      fontWeight: 600,
      fontSize: 13,
      gap: 0.75,
      color: mode === "user" ? "#0f172a" : "#64748b",
      bgcolor: mode === "user" ? "#ffffff" : "transparent",
      transition: "all 160ms ease",
      "&:hover": {
        bgcolor: mode === "user" ? "#ffffff" : "transparent",
      },
    }}
  >
    TARIFF USERS
  </Button>
</Box> */}

<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    p: 0.5,
    borderRadius: "999px",
    bgcolor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    mb: 2.5,
  }}
>
  <Box
    sx={{
      height: 40,
      borderRadius: "999px",
      textTransform: "none",
      fontWeight: 600,
      fontSize: 13,
      color: "#0f172a",
      bgcolor: "#ffffff",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2,   // 👈 replaces button padding
      gap:1,  // 👈 space between icon + text
    }}
  >
    <PersonOutlineRoundedIcon
  sx={{
    fontSize: 18,        // 👈 match text scale
    color: "#64748b",    // 👈 softer than text (better hierarchy)
  }}
/>
    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
      Client Portal
    </Typography>
  </Box>
</Box>

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
              error={!!error}
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

            />{error && (
  <Typography sx={{ color: "red", fontSize: 12 }}>
    Invalid email or password
  </Typography>
)}

<Button
  fullWidth
  variant="contained"
  onClick={handleLogin}
  endIcon={<ArrowForwardRoundedIcon />}
  sx={{
    height: 42,                    // 👈 matches inputs
    textTransform: "none",
    fontSize: 11,
    fontWeight: 600,               // 👈 calmer
    letterSpacing: "0.06em",
    color: "#fff",
    bgcolor: "#1034A6",
    borderRadius: "10px",
    boxShadow: "0 6px 14px rgba(16,52,166,0.18)", // 👈 softer
    "&:hover": {
      bgcolor: "#003D82",
      boxShadow: "0 8px 18px rgba(16,52,166,0.22)",
    },
  }}
>
   {loading ? "Signing in…" : "SIGN IN"}
</Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 0.5,
              }}
            >
            <Typography
              sx={{
                fontSize: 12.5,
                color: "#475569",          // neutral slate
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              Forgot password?
            </Typography>

<Typography sx={{ fontSize: 12.5, color: "#64748b" }}>
  Don’t have an account?{" "}
  <Typography
    onClick={handleGoToSignup}
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
    Sign up
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
