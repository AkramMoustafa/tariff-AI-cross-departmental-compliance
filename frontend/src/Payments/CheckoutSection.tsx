import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

import { startCheckout, fetchPaymentStatus } from "@/api/payment";

export default function Payment() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentStatus()
      .then(setPaid)
      .catch(() => setPaid(false));
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      await startCheckout("tariff_basic");
      // browser redirects to Stripe, no code after this runs
    } catch (err) {
      setError("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  // Still checking payment status
  if (paid === null) {
    return (
      <Box
        minHeight="80vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Already paid
  if (paid) {
    return (
      <Box
        minHeight="80vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Paper sx={{ p: 4, maxWidth: 480 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              You’re all set 🎉
            </Typography>
            <Typography color="text.secondary" align="center">
              Your account has access to all paid features.
            </Typography>
            <Button
              variant="contained"
              href="/dashboard"
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Not paid → Upgrade UI
  return (
    <Box
      minHeight="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Paper sx={{ p: 4, maxWidth: 520, width: "100%" }}>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700}>
            Upgrade your account
          </Typography>

          <Typography color="text.secondary">
            Unlock full access to tariff calculations, supplier tools,
            and compliance features.
          </Typography>

          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Tariff Calculator Pro
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              • Full tariff lookup<br />
              • HS code intelligence<br />
              • Compliance-ready exports
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mt: 2 }}
            >
              $99 <Typography component="span" color="text.secondary">one-time</Typography>
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            variant="contained"
            size="large"
            onClick={handleUpgrade}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Upgrade Now"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}