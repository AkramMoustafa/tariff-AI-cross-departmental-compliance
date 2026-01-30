// src/pages/LandingPage/sections/Navbar.tsx
import { Box, Container, Typography } from "@mui/material";
import { Button } from "@mui/material";

type Props = {
    scrolled: boolean;
};

export default function Navbar({ scrolled }: Props) {
    return (
        <Box
            component="nav"
            sx={{
                position: "fixed",
                top: 0,
                width: "100%",
                zIndex: 1100,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
                transition: "all 0.3s ease",
                // keep this prop even if you don't use it, just in case you later want to change styles
                ...(scrolled ? {} : {}),
            }}
        >
            <Container maxWidth="xl" sx={{ maxWidth: "80rem !important" }}>
                {/* PASTE your NAVIGATION BAR inner JSX from landingpage.tsx here (Logo, links if any). */}
                <Box
                    sx={{
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: { xs: 3, md: 6 },
                    }}
                >
                    {/* Example: keep your existing Logo block exactly */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                bgcolor: "#2C3E50",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "1.125rem",
                            }}
                        >
                            N
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "1rem",
                                fontWeight: 700,
                                letterSpacing: "-0.025em",
                                color: "#2C3E50",
                            }}
                        >
                            NOMIAI
                        </Typography>
                        
                    </Box>
 {/* RIGHT: Navigation */}
<Box sx={{ display: "flex", alignItems: "center", gap: 5 }}>
  {/* Explore API */}
  <Typography
    component="a"
    href="/api"
    sx={{
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#475569", // slate-600
      textDecoration: "none",
      "&:hover": {
        color: "#0f172a",
      },
    }}
  >
    Explore API
  </Typography>

  {/* Pricing */}
  <Typography
    component="a"
    href="/pricing"
    sx={{
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#334155", // slate-700
      textDecoration: "none",
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        left: 0,
        bottom: -4,
        width: "0%",
        height: "2px",
        backgroundColor: "#0f172a",
        transition: "width 0.2s ease",
      },
      "&:hover": {
        color: "#0f172a",
      },
      "&:hover::after": {
        width: "100%",
      },
    }}
  >
    Pricing
  </Typography>
</Box>

</Box>
            </Container>
        </Box>
    );
}
