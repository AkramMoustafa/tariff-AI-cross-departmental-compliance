import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

const MATERIAL_TABS = [
  { label: "Materials", value: "$92.3M", active: true },
  { label: "Steel", value: "$250M" },
  { label: "Aluminum", value: "$1.3B" },
  { label: "Coatings & Lacquers", value: "$125M" },
  { label: "Energy", value: "$160M" },
  { label: "Packaging Materials", value: "$90M" },
  { label: "Chemicals & Process Materials", value: "$55M" },
];

const COUNTRIES = [
  { name: "Total", value: "$1.3B", impact: "$20M" },
  { name: "Canada", value: "$650M", impact: "$15.5M" },
  { name: "South Korea", value: "$168M", impact: "$1M" },
  { name: "Argentina", value: "$125M", impact: "$200K" },
  { name: "China", value: "$117M", impact: "$3.5M" },
  { name: "UAE", value: "$100M", impact: "$900K" },
  { name: "India", value: "$75M", impact: "$500K" },
  { name: "Bahrain", value: "$65M", impact: "$400K" },
];

export default function TariffImpactMaterials() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb */}
      <Typography fontSize={13} color="text.secondary" mb={2}>
        Tariff Impact Overview &nbsp;›&nbsp; <b>Materials</b>
      </Typography>

      {/* Material Tabs */}
      <Stack direction="row" spacing={1.2} mb={3}>
        {MATERIAL_TABS.map((m) => (
          <Paper
            key={m.label}
            sx={{
              px: 2,
              py: 1.5,
              minWidth: 150,
              border: "1px solid #e5e7eb",
              borderLeft: m.active ? "4px solid #f59e0b" : "1px solid #e5e7eb",
              backgroundColor: "#fff",
            }}
          >
            <Typography fontSize={12} fontWeight={600}>
              {m.label}
            </Typography>
            <Typography fontSize={13} color="text.primary">
              {m.value}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* Aluminum Summary */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={2}>
            <Typography fontSize={11} color="text.secondary">
              FY 2025
            </Typography>
            <Typography fontWeight={700}>Aluminum</Typography>
          </Grid>

          {COUNTRIES.map((c) => (
            <Grid item key={c.name}>
              <Typography fontSize={11} color="text.secondary">
                {c.name}
              </Typography>
              <Typography fontWeight={600}>{c.value}</Typography>
              <Typography fontSize={11} sx={{ color: "#f59e0b" }}>
                {c.impact}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Supplier Table */}
      <Paper>
        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "2.5fr 1fr 1fr 1fr 1fr 1.2fr 1fr 1fr 1fr",
            px: 2,
            py: 1,
            fontSize: 11,
            color: "text.secondary",
          }}
        >
          {[
            "Suppliers",
            "Cases",
            "Preferred",
            "Contracts",
            "All POs",
            "Spend",
            "% Spend",
            "% Change",
            "$ Change",
          ].map((h) => (
            <Typography key={h} fontWeight={600}>
              {h.toUpperCase()}
            </Typography>
          ))}
        </Box>

        <Divider />

        {/* Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "2.5fr 1fr 1fr 1fr 1fr 1.2fr 1fr 1fr 1fr",
            px: 2,
            py: 1.2,
            alignItems: "center",
            fontSize: 13,
          }}
        >
          <Typography fontWeight={500}>
            Rio Tinto Aluminum (Alcan)
          </Typography>

          <Chip label="2" size="small" />
          <Chip
            label="P"
            size="small"
            color="success"
            variant="outlined"
          />
          <Typography>15</Typography>
          <Typography>2,930</Typography>
          <Typography>$117M</Typography>
          <Typography>13.0%</Typography>
          <Typography>10.0%</Typography>
          <Typography>$12.0M</Typography>
        </Box>

        <Divider />

        {/* Expanders */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            fontSize={13}
            sx={{ color: "#2563eb", cursor: "pointer", mb: 0.5 }}
          >
            ▸ Alternative International Suppliers (41)
          </Typography>
          <Typography
            fontSize={13}
            sx={{ color: "#2563eb", cursor: "pointer" }}
          >
            ▸ Alternative Domestic Suppliers (17)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
