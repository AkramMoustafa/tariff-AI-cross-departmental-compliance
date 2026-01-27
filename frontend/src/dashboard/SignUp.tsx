import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

import { signupClientUser } from "@/api/apiClientAuth";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailSignUp = async () => {
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

      // ✅ client_user_token is stored internally
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* LEFT SIDE */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1670956007923-b78e45e011d8?auto=format&fit=crop&q=80&w=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center" px={4}>
            <Typography variant="h3" sx={{ color: "white", fontWeight: 800 }}>
              Join NomiAI
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Start automating your compliance today.
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* RIGHT SIDE */}
      <Grid
        item
        xs={12}
        md={6}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, md: 8 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            sx={{ mb: 2 }}
          >
            Create Account
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <Typography color="error" textAlign="center">
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.4,
                background: "linear-gradient(90deg, #7F2458, #F15BB5)",
                fontWeight: 600,
                borderRadius: "8px",
              }}
              onClick={handleEmailSignUp}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <Divider sx={{ my: 2 }}>or</Divider>

            <Button
              variant="outlined"
              startIcon={<Google />}
              fullWidth
              disabled
            >
              Google signup (coming soon)
            </Button>

            <Typography variant="body2" textAlign="center" mt={2}>
              Already have an account?{" "}
              <Link
                to="/signin"
                style={{ textDecoration: "none", fontWeight: 600 }}
              >
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}