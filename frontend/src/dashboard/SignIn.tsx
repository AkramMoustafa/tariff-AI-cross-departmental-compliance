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

console.log("[SignIn] raw VITE_API_BASE_URL:", rawEnvBase);
console.log("[SignIn] window.location.hostname:", window.location.hostname);

const BASE_URL =
  rawEnvBase && rawEnvBase.trim() !== ""
    ? rawEnvBase.trim()
    : window.location.hostname.includes("localhost")
    ? "http://localhost:8000"
    : "https://api.nomioc.com";

console.log("[SignIn] RESOLVED BASE_URL:", BASE_URL);

export default function SignIn() {
  const { refreshSession } = useSession(); // ✅ correct API

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("[SignIn] handleLogin clicked");
    console.log("[SignIn] email:", email);

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("[SignIn] Sending POST /api/auth/login");

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("[SignIn] Login response status:", response.status);

      const data = await response.json();
      console.log("[SignIn] Login response body:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (!data.access_token) {
        throw new Error("Invalid login response (missing access_token)");
      }

      console.log("[SignIn] Storing access_token in localStorage");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type || "bearer");

      setSuccess("Login successful");

      await refreshSession();

      navigate("/redirect", { replace: true });

    } catch (err: any) {
      console.error("[SignIn] Login error:", err);
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
            Secure access to your compliance workspace.
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

          <Typography color="text.secondary" mb={4}>
            Enter your email and password
          </Typography>

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
