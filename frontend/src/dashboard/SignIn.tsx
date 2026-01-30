import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

const rawEnvBase = import.meta.env.VITE_API_BASE_URL;

const BASE_URL =
  rawEnvBase && rawEnvBase.trim() !== ""
    ? rawEnvBase.trim()
    : window.location.hostname.includes("localhost")
    ? "http://localhost:8000"
    : "https://api.nomioc.com";

export default function SignIn() {
  const { refreshSession } = useSession();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<"cdc" | "user">("cdc");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const endpoint =
      loginType === "cdc"
        ? "/api/auth/login"
        : "/api/client-users/login-user"; 

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (!data.access_token) {
        throw new Error("Invalid login response");
      }

      if (loginType === "user") {
        // 🔑 CLIENT USER
        localStorage.setItem("client_user_token", data.access_token);
        localStorage.removeItem("access_token"); // prevent leakage
      } else {
        // 🔑 CDC USER
        localStorage.setItem("access_token", data.access_token);
        localStorage.removeItem("client_user_token"); // 🔥 VERY IMPORTANT
      }


      localStorage.setItem("login_type", loginType);

      setSuccess("Login successful");
      if (loginType === "cdc") {
        await refreshSession();
      }


      if (loginType === "user") {
      navigate("/tariffs", { replace: true });
      } else {
      navigate("/redirect", { replace: true });
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* LEFT PANEL */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
        }}
      >
        <Box maxWidth={420}>
          <Typography variant="overline" sx={{ color: "#94a3b8" }}>
            NOMIAI PLATFORM
          </Typography>
          <Typography variant="h3" sx={{ color: "white", fontWeight: 800 }}>
            Compliance made simple.
          </Typography>
          <Typography sx={{ color: "#cbd5e1", mt: 2 }}>
            Secure access to your workspace.
          </Typography>
        </Box>
      </Grid>

      {/* RIGHT PANEL */}
      <Grid
        item
        xs={12}
        md={6}
        component={Paper}
        square
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={800} mb={1}>
            Sign in
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Choose your account type and continue
          </Typography>

          {/* ACCOUNT TYPE SELECTOR */}
          <Stack direction="row" spacing={2} mb={4}>
            <Button
              fullWidth
              variant={loginType === "cdc" ? "contained" : "outlined"}
              onClick={() => setLoginType("cdc")}
            >
              Compliance (CDC)
            </Button>

            <Button
              fullWidth
              variant={loginType === "user" ? "contained" : "outlined"}
              onClick={() => setLoginType("user")}
            >
              Standard User
            </Button>
          </Stack>

          {/* FORM */}
          <Stack spacing={2}>
            <TextField
              label="Email"
              value={email}
              fullWidth
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Button
              fullWidth
              disabled={loading}
              onClick={handleLogin}
              sx={{
                py: 1.4,
                fontWeight: 700,
                backgroundColor: "#0f172a",
                color: "white",
                "&:hover": { backgroundColor: "#020617" },
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Typography textAlign="center" mt={2}>
              Don’t have an account?{" "}
              <Link to="/signup" style={{ fontWeight: 600 }}>
                Sign up
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}