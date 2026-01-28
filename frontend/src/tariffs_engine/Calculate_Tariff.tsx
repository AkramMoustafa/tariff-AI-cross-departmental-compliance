import { calculateTariff } from "@/api/tariffClient";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import Sidebar from "./sidebar"

export default function TariffCalculatorPage() {
  const [hsCode, setHsCode] = useState("");
  const [customsValue, setCustomsValue] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await calculateTariff({
        hs_code: hsCode,
        origin_country: "EG",
        destination_country: "US",
        customs_value: customsValue,
        currency: "USD",
      });

      setResult(response);
    } catch (err) {
      setError("Failed to calculate tariff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <TextField
        label="HS Code"
        value={hsCode}
        onChange={(e) => setHsCode(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Customs Value"
        type="number"
        value={customsValue}
        onChange={(e) => setCustomsValue(Number(e.target.value))}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        onClick={handleCalculate}
        disabled={loading}
      >
        {loading ? "Calculating..." : "Calculate"}
      </Button>

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {result && (
        <Box mt={3}>
          <Typography variant="h6">Result</Typography>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}