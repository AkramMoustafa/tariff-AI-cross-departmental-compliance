
// SupplierRiskProfile.tsx
// Supplier Risk Intelligence + Governance View
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getCountryNewsEvents } from "@/api/countryRisk";
import { useLocation } from "react-router-dom";
import { getPortActivity,getPorts,getSupplier ,verifyCorporateRegistry,previewSupplierJobs , getCountryRisk ,getCountries } from "@/api/SupplierIntelligence";
import Autocomplete from "@mui/material/Autocomplete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { updateLinkedinCompanyName,getHiringInsight  } from "@/api/SupplierIntelligence";



const getRiskLevel = (score: number) => {
  if (score >= 70) return { label: "High", color: "error" as const };
  if (score >= 50) return { label: "Moderate", color: "warning" as const };
  return { label: "Low", color: "success" as const };
};

const getWorkflowStatus = (score: number) => {
  if (score >= 70) return "Escalation Required";
  if (score >= 50) return "Review Required";
  return "Approved";
};

const RiskCard = ({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description: string;
}) => {
  const level = getRiskLevel(score);


  return (
    
    <Paper
    
    elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
      }}
    >
      <Typography fontWeight={600} mb={1}>
        {title}
      </Typography>

      <Box display="flex" alignItems="center" mb={1}>
        <Box flex={1} mr={2}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Box>
        <Typography fontWeight={600}>{score}</Typography>
      </Box>

      <Chip
        label={level.label}
        color={level.color}
        size="small"
        sx={{ mb: 1 }}
      />

      <Typography fontSize={13} color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
};

export default function SupplierRiskProfile() {
 const [editingLinkedin, setEditingLinkedin] = useState(false);
const [linkedinName, setLinkedinName] = useState("");
  const location = useLocation();
  const { supplierId } = useParams<{ supplierId: string }>();
  const { formData } = location.state || {};
  const [supplierData, setSupplierData] = useState<any>(null);

  const [countryCheckLoading, setCountryCheckLoading] = useState(false);
  const [countryVerified, setCountryVerified] = useState<boolean | null>(null);
  const [portCheckLoading, setPortCheckLoading] = useState(false);
  const [filingCheckLoading, setFilingCheckLoading] = useState(false);
  const [filingsVerified, setFilingsVerified] = useState<boolean | null>(null);
  const [portRisk, setPortRisk] = useState<any>(null);
  const [portLoading, setPortLoading] = useState(false);
  const [hiringInsight, setHiringInsight] = useState<any | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const navigate = useNavigate();
  const [riskScores, setRiskScores] = useState({
  market: 0,
  policy: 0,
  operational: 0,
  counterparty: 0,
});

const [overallRisk, setOverallRisk] = useState(0);
  const level = getRiskLevel(overallRisk);
  const workflowStatus = getWorkflowStatus(overallRisk);
const supplier = {
  name: supplierData?.name || formData?.legalName,
  country: supplierData?.country || formData?.countryIncorporation,
  currency: formData?.invoicingCurrency,
  primaryPort: supplierData?.profile?.export_port || formData?.exportPort,
  incoterm: formData?.incoterm,
};

const getTrendIcon = (trend: string) => {
  if (trend === "HIRING_SURGE" || trend === "EXPANSION")
    return <ArrowUpwardIcon color="success" />;

  if (trend === "HIRING_DROP")
    return <ArrowDownwardIcon color="error" />;

  return <TrendingFlatIcon color="warning" />;
};
const SectionCard = ({ title, children }: any) => (
  <Paper
    elevation={0}
    sx={{
      p: 4,
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      backgroundColor: "#ffffff",
      mb: 4,
    }}
  >
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: 16,
        mb: 3,
      }}
    >
      {title}
    </Typography>

    {children}
  </Paper>
);

const [jobsFound, setJobsFound] = useState<number | null>(null);
const [loading, setLoading] = useState(false);
const [decision, setDecision] = useState<string | null>(null);
const [notes, setNotes] = useState("");
const [countries, setCountries] = useState<string[]>([]);
const [ports, setPorts] = useState<string[]>([]);
const [newsEvents, setNewsEvents] = useState<any[]>([]);
const [newsLoading, setNewsLoading] = useState(false);
useEffect(() => {
  if (supplierData?.profile?.export_port) {
    setPortInput(supplierData.profile.export_port);
  }
}, [supplierData]);
const loadCountryNews = async () => {
  if (!countryJurisdiction) {
    console.warn("Country jurisdiction missing");
    return;
  }

  try {
    setNewsLoading(true);

    const data = await getCountryNewsEvents(countryJurisdiction);

    setNewsEvents(data.events || []);
    setCountryRiskScore(data.risk_score);
    setCountryRiskLevel(data.risk_level);

  } catch (err) {
    console.error("Failed to load news events", err);
  } finally {
    setNewsLoading(false);
  }
};
const [countryJurisdiction, setCountryJurisdiction] = useState(
  supplier.country || ""
);
const verifyCountry = async () => {
  try {
    setCountryCheckLoading(true);

    if (!countryJurisdiction) {
      console.warn("Country jurisdiction missing");
      return;
    }

    await loadCountryNews();

    setCountryVerified(true);

  } catch (err) {
    console.error("Country verification failed", err);
  } finally {
    setCountryCheckLoading(false);
  }
};
const [registryLink, setRegistryLink] = useState("");
const [registryData, setRegistryData] = useState<any | null>(null);
const [registryLoading, setRegistryLoading] = useState(false);

const verifyRegistry = async () => {
  if (!registryLink) return;

  try {
    setRegistryLoading(true);

    const data = await verifyCorporateRegistry(
  Number(supplierId),
  registryLink
);

    console.log("Registry response:", data);

    setRegistryData(data);

  } catch (err) {
    console.error("Registry verification failed", err);
  } finally {
    setRegistryLoading(false);
  }
};
const saveLinkedinName = async () => {
  try {
    const data = await updateLinkedinCompanyName(
      Number(supplierId),
      linkedinName
    );

    setHiringInsight((prev: any) => ({
      ...prev,
      linkedin_company_name: data.linkedin_company_name
    }));

    setEditingLinkedin(false);

  } catch (err) {
    console.error("Failed to update LinkedIn name", err);
  }
};
const [countryRiskLevel, setCountryRiskLevel] = useState<string | null>(null);
const [countryRiskScore, setCountryRiskScore] = useState<number | null>(null);
const verifyLinkedInCompany = async () => {
  try {
    if (!supplierId) return;

    console.log("Supplier ID:", supplierId);

    setLoading(true);

    const data = await previewSupplierJobs(Number(supplierId));

    console.log("Backend response:", data);

    setHiringInsight({
      current_jobs: data.current_jobs,
      previous_jobs: data.previous_jobs,
      trend: data.trend,
      risk_level: data.risk_level,
      insight: data.insight
    });

  } catch (err) {
    console.error("Verification failed", err);
  } finally {
    setLoading(false);
  }
};
const [portInput, setPortInput] = useState(supplier.primaryPort || "");

const loadPortRisk = async () => {
  console.log("Button clicked");

  if (!portInput) return;

  try {
    setPortLoading(true);

const data = await getPortActivity(
  Number(supplierId),
  portInput
);
    setPortRisk(data);

  } catch (err) {
    console.error("Port analytics failed", err);
  } finally {
    setPortLoading(false);
  }
};
useEffect(() => {
  const loadCountries = async () => {
    try {
      const data = await getCountries();
      setCountries(data.countries);
    } catch (err) {
      console.error("Failed to load countries", err);
    }
  };

  loadCountries();
}, []);
useEffect(() => {

  const loadPorts = async () => {
    try {
      const data = await getPorts();
      setPorts(data.ports);
    } catch (err) {
      console.error("Failed to load ports", err);
    }
  };

  loadPorts();

}, []);
useEffect(() => {
  const loadSupplier = async () => {
    try {
const data = await getSupplier(Number(supplierId));
setSupplierData(data);

if (data.country) {
  setCountryJurisdiction(data.country);
}

      if (data.country) {
        setCountryJurisdiction(data.country);
      }

    } catch (err) {
      console.error("Failed to load supplier", err);
    }
  };

  if (supplierId) {
    loadSupplier();
  }
}, [supplierId]);
useEffect(() => {
  if (portInput) {
    loadPortRisk();
  }
}, []);
const checkCountryRisk = async () => {
  if (!countryJurisdiction) {
    console.warn("Country jurisdiction missing");
    return;
  }

  try {
    setCountryCheckLoading(true);

    const data = await getCountryRisk(countryJurisdiction);

    setCountryRiskScore(data.risk_score);
    setCountryRiskLevel(data.risk_level);

  } catch (err) {
    console.error("Country risk fetch failed", err);
  } finally {
    setCountryCheckLoading(false);
  }
};
useEffect(() => {
  const loadHiringInsight = async () => {
    try {
    const data = await getHiringInsight(Number(supplierId));
      if (!data.message) {
        setHiringInsight(data);
        setLinkedinName(data.linkedin_company_name || "");
      }
      if (!data.message) {
        setHiringInsight(data);
      }

    } catch (err) {
      console.error("Failed to load hiring insight", err);
    } finally {
      setInsightLoading(false);
    }
  };

  if (supplierId) {
    loadHiringInsight();
  }
}, [supplierId]);

useEffect(() => {
  let market = 0;
  let policy = 0;
  let operational = 0;
  let counterparty = 0;

  if (countryRiskScore !== null) {
    policy = countryRiskScore * 100; // already 0–1 → convert to %
  }

  if (portRisk?.health_score !== undefined) {
    operational = 100 - portRisk.health_score; // worse port = higher risk
  }

  if (hiringInsight?.risk_level) {
    if (hiringInsight.risk_level === "HIGH") counterparty += 70;
    if (hiringInsight.risk_level === "MEDIUM") counterparty += 50;
    if (hiringInsight.risk_level === "LOW") counterparty += 20;
  }

  if (registryData?.health_score !== undefined) {
    counterparty += (100 - registryData.health_score);
    counterparty = counterparty / 2; // normalize
  }

  market = 25;

  setRiskScores({
    market,
    policy,
    operational,
    counterparty,
  });

}, [countryRiskScore, portRisk, hiringInsight, registryData]);
useEffect(() => {
  const weights = {
    market: 0.2,
    policy: 0.25,
    operational: 0.3,
    counterparty: 0.25,
  };

  const total =
    riskScores.market * weights.market +
    riskScores.policy * weights.policy +
    riskScores.operational * weights.operational +
    riskScores.counterparty * weights.counterparty;

  setOverallRisk(Math.round(total));
}, [riskScores]);


  return (
    <Box sx={{ maxWidth: 1300, mx: "auto", mt: 6, mb: 8, px: 3 }}>
      <Box
        sx={{
          background: "#ffffff",
          borderRadius: "20px",
          p: 5,
          border: "1px solid #e5e7eb",
          boxShadow: "0 12px 40px rgba(0,0,0,0.05)",
        }}

        
      >
<Paper
  elevation={0}
  sx={{
    p: 4,
    mb: 4,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  }}
>
  {/* TOP ROW */}
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    mb={1}
  >
    {/* LEFT: Supplier name */}
    <Typography
      sx={{
        fontSize: 26,
        fontWeight: 700,
      }}
    >
      {supplier.name}
    </Typography>

    {/* RIGHT: Risk + Button */}
    <Stack direction="row" spacing={2} alignItems="center">
      
      <Chip
        label={`${level.label} Risk`}
        color={level.color}
        sx={{
          fontWeight: 600,
          fontSize: 13,
          height: 32,
        }}
      />

      <Button
        variant="contained"
        onClick={() => navigate("/SupplierRiskInsights")}
        sx={{
          height: 36,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          fontSize: 14,
          backgroundColor: "#0f172a",
          boxShadow: "none",
          px: 2.5,
          "&:hover": {
            backgroundColor: "#1e293b",
            boxShadow: "none",
          },
        }}
      >
        Advanced Analytics
      </Button>

    </Stack>
  </Box>

  {/* METADATA ROW */}
  <Typography
    sx={{
      fontSize: 14,
      color: "#64748b",
    }}
  >
    {supplier.country} • {supplier.currency} • Port: {supplier.primaryPort} • Incoterm: {supplier.incoterm}
  </Typography>

</Paper>

        <Paper
  elevation={0}
  sx={{
    p: 3,
    mb: 4,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  }}
>
  <Typography fontWeight={600} mb={2}>
    Country Risk Dataset
  </Typography>

  <Stack direction="row" spacing={2} alignItems="center">
<Autocomplete
  options={countries}
  value={countryJurisdiction}
  onChange={(event, newValue) => {
    setCountryJurisdiction(newValue || "");
  }}
  sx={{ width: 300 }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Country"
      size="small"
      helperText="Select country from dataset"
    />
  )}
/>
    <Button
      variant="contained"
      onClick={checkCountryRisk}
      disabled={countryCheckLoading}
    >
      {countryCheckLoading ? "Checking..." : "Check Country Risk"}
    </Button>
  </Stack>

  {countryRiskScore !== null && (
    <Box mt={2}>
<Box>
  <Typography fontSize={13} color="text.secondary">
    Country Risk Score
  </Typography>

  <Typography fontSize={28} fontWeight={700}>
    {(countryRiskScore! * 100).toFixed(1)}%
  </Typography>

  <LinearProgress
    variant="determinate"
    value={(countryRiskScore! * 100)}
    sx={{
      height: 10,
      borderRadius: 6,
      mt: 1,
      backgroundColor: "#e2e8f0"
    }}
  />
</Box>
      <Chip
        label={countryRiskLevel}
        color={
          countryRiskLevel === "High Risk"
            ? "error"
            : countryRiskLevel === "Medium Risk"
            ? "warning"
            : "success"
        }
        sx={{ mt: 1 }}
      />
    </Box>
  )}
</Paper>
{/* Header */}
<Stack
  direction="row"
  justifyContent="space-between"
  alignItems="flex-start"
  mb={3}
>



</Stack>
{/* LinkedIn Hiring Intelligence */}
<Paper
  elevation={0}
  sx={{
    p: 3,
    mb: 4,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  }}
>
  <Typography fontWeight={700} mb={3}>
    Supplier Hiring Intelligence
  </Typography>

  {/* Top row */}
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    mb={2}
  >
    <Box>
      <Typography fontSize={12} color="text.secondary">
        LinkedIn Company
      </Typography>

      <Typography fontWeight={600}>
        {hiringInsight?.linkedin_company_name || supplier.name}
      </Typography>
    </Box>

    <Button
      size="small"
      variant="outlined"
      onClick={verifyLinkedInCompany}
      disabled={loading}
      sx={{ textTransform: "none", borderRadius: "8px" }}
    >
      {loading ? "Scanning..." : "Refresh Scan"}
    </Button>
  </Stack>

  {/* Workforce Signal */}
  {hiringInsight && (
    <Box
      sx={{
        p: 2,
        borderRadius: "12px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e5e7eb",
        mb: 3,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {getTrendIcon(hiringInsight.trend)}

        <Box>
          <Typography fontWeight={600}>
            Workforce Activity Signal
          </Typography>

          <Typography fontSize={14} color="text.secondary">
            {hiringInsight.insight}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )}

  {/* Metrics */}
  {hiringInsight && (
    <Grid container spacing={3}>

      <Grid item xs={3}>
        <Typography fontSize={12} color="text.secondary">
          Current Jobs
        </Typography>
        <Typography fontSize={22} fontWeight={700}>
          {hiringInsight.current_jobs}
        </Typography>
      </Grid>

      <Grid item xs={3}>
        <Typography fontSize={12} color="text.secondary">
          Previous
        </Typography>
        <Typography fontSize={22} fontWeight={700}>
          {hiringInsight.previous_jobs}
        </Typography>
      </Grid>

      <Grid item xs={3}>
        <Typography fontSize={12} color="text.secondary">
          Change
        </Typography>
        <Typography
          fontSize={22}
          fontWeight={700}
          color="success.main"
        >
          {hiringInsight.current_jobs - hiringInsight.previous_jobs}
        </Typography>
      </Grid>

      <Grid item xs={3}>
        <Typography fontSize={12} color="text.secondary">
          Risk
        </Typography>

        <Chip
          label={hiringInsight.risk_level}
          size="small"
          color={
            hiringInsight.risk_level === "HIGH"
              ? "error"
              : hiringInsight.risk_level === "MEDIUM"
              ? "warning"
              : "success"
          }
        />
      </Grid>

    </Grid>
  )}
</Paper>
<Paper
  elevation={0}
  sx={{
    p: 3,
    mb: 4,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  }}
>
  <Typography fontWeight={600} mb={2}>
    Regulatory & Corporate Verification
  </Typography>
{/* Port Infrastructure Verification */}
<Stack direction="row" spacing={2} alignItems="center">
<Autocomplete
  options={ports}
  value={portInput}
  onChange={(event, newValue) => {
    setPortInput(newValue || "");
  }}
  sx={{ width: 300 }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Export Port"
      size="small"
      helperText="Live AIS congestion analysis — may take upto 3 minutes seconds."
    />
  )}
/>
<Button
  variant="contained"
  onClick={loadPortRisk}
  disabled={portLoading}
>
  {portLoading ? "Analyzing..." : "Analyze Port"}
</Button>

{portRisk && (
  <Chip
    label={`Port Status: ${portRisk.status}`}
    color={
      portRisk.status === "Healthy"
        ? "success"
        : portRisk.status === "Moderate"
        ? "warning"
        : "error"
    }
  />
)}
</Stack>
{/* Port Congestion Intelligence */}
<Box
  sx={{
    mt: 3,
    p: 3,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
  }}
>
  <Typography fontWeight={700} mb={3}>
    Port Congestion Intelligence
  </Typography>

  {portLoading ? (
    <Typography>Loading port analytics...</Typography>
  ) : portRisk ? (
    <>
      {/* Metrics Row */}
      <Grid container spacing={3} mb={3}>

        <Grid item xs={2}>
          <Typography fontSize={12} color="text.secondary">
            Ships
          </Typography>
          <Typography fontSize={22} fontWeight={700}>
            {portRisk.ships_in_area}
          </Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography fontSize={12} color="text.secondary">
            Moving
          </Typography>
          <Typography fontSize={22} fontWeight={700}>
            {portRisk.moving}
          </Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography fontSize={12} color="text.secondary">
            Anchored
          </Typography>
          <Typography fontSize={22} fontWeight={700}>
            {portRisk.anchored}
          </Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography fontSize={12} color="text.secondary">
            Entering
          </Typography>
          <Typography fontSize={22} fontWeight={700}>
            {portRisk.entering}
          </Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography fontSize={12} color="text.secondary">
            Leaving
          </Typography>
          <Typography fontSize={22} fontWeight={700}>
            {portRisk.leaving}
          </Typography>
        </Grid>

      </Grid>

      {/* Health Score */}
      <Box mt={2}>
        <Typography fontSize={12} color="text.secondary">
          Port Health Score
        </Typography>

        <Typography fontSize={34} fontWeight={700}>
          {portRisk.health_score}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={portRisk?.health_score ?? 0}
          sx={{
            height: 10,
            borderRadius: 6,
            mt: 1,
            backgroundColor: "#e2e8f0"
          }}
        />

        <Chip
          label={portRisk.status}
          color={
            portRisk.status === "Healthy"
              ? "success"
              : portRisk.status === "Moderate"
              ? "warning"
              : "error"
          }
          sx={{ mt: 2 }}
        />
      </Box>
    </>
  ) : (
    <Typography>No port analytics available</Typography>
  )}
</Box>

  
</Paper>
<Stack spacing={3} sx={{ mt: 3 }}>

  {/* Registry Input */}
  <Stack
  direction="row"
  spacing={2}
  alignItems="center"
  sx={{ mb: 3 }}
>
    <TextField
      size="small"
      label="Corporate Registry Link"
      placeholder="Paste ISED registry link"
      value={registryLink}
      onChange={(e) => setRegistryLink(e.target.value)}
      sx={{ width: 420 }}
    />

    <Button
      variant="contained"
      onClick={verifyRegistry}
      disabled={registryLoading}
    >
      {registryLoading ? "Checking..." : "Verify Registry"}
    </Button>
  </Stack>

  {/* Registry Results */}
  {registryData && (
    <Box
      sx={{
        p: 3,
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#f8fafc"
      }}
    >
      <Typography fontWeight={700} mb={3}>
        Corporate Registry Health Check
      </Typography>

      {/* Governance Score */}
      <Box mb={3}>
        <Typography fontSize={12} color="text.secondary">
          Governance Health Score
        </Typography>

        <Typography fontSize={32} fontWeight={700}>
          {registryData.health_score}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={registryData.health_score ?? 0}
          sx={{
            height: 10,
            borderRadius: 6,
            mt: 1,
            backgroundColor: "#e2e8f0"
          }}
        />

        <Chip
          label={registryData.status}
          color={
            registryData.status === "HEALTHY"
              ? "success"
              : registryData.status === "WATCH"
              ? "warning"
              : "error"
          }
          sx={{ mt: 2, fontWeight: 600 }}
        />
      </Box>

      {/* Governance Signals */}
      <Box mb={3}>
        <Typography fontWeight={600} mb={1}>
          Governance Signals
        </Typography>

        {registryData.signals?.map((s: string, i: number) => (
          <Typography key={i} fontSize={14} sx={{ mb: 1 }}>
            ✓ {s}
          </Typography>
        ))}
      </Box>

      {/* Directors */}
      {registryData.directors?.length > 0 && (
        <Box mb={3}>
          <Typography fontWeight={600} mb={1}>
            Directors
          </Typography>

          {registryData.directors.map((d: string, i: number) => (
            <Typography key={i} fontSize={14} sx={{ mb: 0.5 }}>
              {d}
            </Typography>
          ))}
        </Box>
      )}

      {/* Filings */}
      {registryData.filings?.length > 0 && (
        <Box mb={3}>
          <Typography fontWeight={600} mb={1}>
            Filings
          </Typography>

          {registryData.filings.map((f: string, i: number) => (
            <Typography key={i} fontSize={14} sx={{ mb: 0.5 }}>
              {f}
            </Typography>
          ))}
        </Box>
      )}

      {/* Corporate History */}
      {typeof registryData.history_count === "number" && (
        <Box mb={3}>
          <Typography fontWeight={600} mb={1}>
            Corporate History Events
          </Typography>

          <Typography fontSize={14} color="text.secondary">
            {registryData.history_count} events recorded
          </Typography>
        </Box>
      )}

      {/* Risks */}
      {registryData.risks?.length > 0 ? (
        <Box mt={3}>
          <Typography fontWeight={600} color="error" mb={1}>
            Risk Indicators
          </Typography>

          {registryData.risks.map((r: string, i: number) => (
            <Typography key={i} fontSize={14} color="error" sx={{ mb: 0.5 }}>
              ⚠ {r}
            </Typography>
          ))}
        </Box>
      ) : (
        <Typography fontSize={13} color="text.secondary">
          No corporate risk events detected
        </Typography>
      )}

    </Box>
  )}

</Stack>
<Stack
  direction="row"
  spacing={2}
  alignItems="center"
  sx={{ mb: 3 }}
>
<TextField
  size="small"
  label="Country Jurisdiction"
  value={countryJurisdiction}
  onChange={(e) => setCountryJurisdiction(e.target.value)}
/>

  <Button
    variant="contained"
    onClick={verifyCountry}
    disabled={countryCheckLoading}
    sx={{
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 600,
      backgroundColor: "#0f172a",
      "&:hover": { backgroundColor: "#1e293b" },
    }}
  >
    {countryCheckLoading ? "Checking..." : "Verify Country"}
  </Button>

  {countryVerified !== null && (
    <Chip
      label={countryVerified ? "Country Cleared" : "Country Risk Flag"}
      color={countryVerified ? "success" : "error"}
    />
  )}
</Stack>

{/* MOVE THIS OUTSIDE */}
<Paper
  elevation={0}
  sx={{
    p: 3,
    mb: 4,
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
  }}
>
  <Typography fontWeight={600} mb={2}>
    Country Risk News Intelligence
  </Typography>

  {newsLoading ? (
    <Typography>Loading news risk events...</Typography>
  ) : newsEvents.length === 0 ? (
    <Chip label="No recent risk events detected" color="success" />
  ) : (
    newsEvents.map((event, index) => (
      <Box key={index} mb={2}>
        <Typography fontWeight={600}>{event.event}</Typography>

        <Typography fontSize={13} color="text.secondary">
          Location: {event.location}
        </Typography>

        <Chip
          label={event.severity}
          color={
            event.severity === "high"
              ? "error"
              : event.severity === "medium"
              ? "warning"
              : "success"
          }
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>
    ))
  )}
</Paper>
        {/* Overall Risk */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 5,
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography fontWeight={600} mb={2}>
            Overall Supplier Risk Score
          </Typography>

          <Box display="flex" alignItems="center">
            <Box flex={1} mr={2}>
              <LinearProgress
                variant="determinate"
                value={overallRisk}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography fontSize={22} fontWeight={700}>
              {overallRisk}
            </Typography>
          </Box>

          <Typography mt={2} fontSize={14} color="#475569">
            Volume Dependency: {formData?.categoryVolumeSharePct}%
          </Typography>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* Risk Breakdown */}
        <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
          Risk Breakdown
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Market Exposure"
              score={riskScores.market}
              description="FX volatility, commodity linkage, freight sensitivity."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Policy Exposure"
              score={riskScores.policy}
              description="Tariff risk, sanctions exposure, trade dispute sensitivity."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Operational Risk"
              score={riskScores.operational}
              description="Port congestion, infrastructure reliability, delay history."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskCard
              title="Counterparty Risk"
              score={riskScores.counterparty}
              description="Financial stability, credit profile, default exposure."
            />
          </Grid>
        </Grid>

        {/* Governance Section */}
        {workflowStatus !== "Approved" && (
          <>
            <Divider sx={{ my: 5 }} />

            <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
              Review & Decision
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter review notes or mitigation plan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                onClick={() => setDecision("Approved")}
              >
                Approve
              </Button>

              <Button
                variant="outlined"
                onClick={() => setDecision("Approved with Conditions")}
              >
                Approve with Conditions
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => setDecision("Escalated")}
              >
                Escalate
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => setDecision("Rejected")}
              >
                Reject
              </Button>
            </Stack>

            {decision && (
              <Typography mt={3} fontWeight={600}>
                Decision Recorded: {decision}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}