// src/pages/LandingPage/sections/Navbar.tsx
import { Box, Container, Typography, Button } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

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
        ...(scrolled ? {} : {}),
      }}
    >
      <Container maxWidth="xl" sx={{ maxWidth: "80rem !important" }}>
        <Box
          sx={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 3, md: 6 },
          }}
        >
          {/* LEFT — Logo */}
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
                transform: "translateX(-12px)",
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
                transform: "translateX(-12px)",
              }}
            >
              NOMIAI
            </Typography>
          </Box>

          {/* CENTER — Product Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 4,
              transform: "translateX(-150px)",
            }}
          >
            {[
              { label: "Products", href: "#features" },
              { label: "Solutions", href: "https://www.linkedin.com/feed/update/urn:li:activity:7422866173794467840/" ,  external: true, },
              { label: "Pricing", href: "/pricing" },
          
            ].map((item) => (
              <Typography
                key={item.label}
                component="a"
                href={item.href}
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#475569",
                  textDecoration: "none",
                  position: "relative",
                  "&:hover": {
                    color: "#0f172a",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    bottom: -6,
                    width: "0%",
                    height: "2px",
                    backgroundColor: "#0f172a",
                    transition: "width 0.2s ease",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          {/* RIGHT — Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              href="/signin"
              variant="text"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#475569",
                textTransform: "none",
                "&:hover": {
                  color: "#0f172a",
                  backgroundColor: "transparent",
                },
              }}
            >
              Sign in
            </Button>
<Button
endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
  onClick={() => {
    const subject = encodeURIComponent("Enterprise Plan Inquiry");
    const body = encodeURIComponent(
      `Hello Sales Team,

I'm interested in learning more about NomiAI.

Company Name:
Estimated number of suppliers:
Estimated users:
Use case:

Best regards,`
    );

    window.location.href = `mailto:sales@nomioc.com?subject=${subject}&body=${body}`;
  }}
  sx={{
    textTransform: "none",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "#ffffff",
    bgcolor: "#1034A6",
    px: 1.75,
    py: 0.5,
    minHeight: 28,
    borderRadius: "8px",
    boxShadow: "none",
    "&:hover": {
      bgcolor: "#0d246f",
    },
  }}
>
  Contact Sales
</Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}