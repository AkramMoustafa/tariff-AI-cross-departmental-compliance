// src/pages/LandingPage/sections/Navbar.tsx
import { Box, Container, Typography, Button, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useState } from "react";

type Props = {
  scrolled: boolean;
};

export default function Navbar({ scrolled }: Props) {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation menu items
  const navItems = [
    { label: "Solutions", href: "#solutions" },
    { label: "Products", href: "#features" },
    { label: "pilot", href: "#pilot" },
  ];

  // Email template for contact sales
  const handleContactSales = () => {
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
  };

  // Handle mobile nav click - close drawer and navigate
  const handleMobileNavClick = (href: string) => {
    setMobileMenuOpen(false);
    // Small delay to allow drawer to close before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <Box
        component="nav"
        sx={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1100,
          bgcolor: scrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid rgba(226, 232, 240, 0.8)" : "1px solid rgba(226, 232, 240, 0.4)",
          boxShadow: scrolled ? "0 2px 8px rgba(0, 0, 0, 0.04)" : "none",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Container maxWidth="xl" sx={{ maxWidth: "80rem !important" }}>
          <Box
            sx={{
              height: { xs: 56, md: 64 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2, md: 4 },
            }}
          >
            {/* Logo Section */}
            <Box
              component="a"
              href="#"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                textDecoration: "none",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#2C3E50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  boxShadow: "0 2px 8px rgba(44, 62, 80, 0.15)",
                }}
              >
                N
              </Box>

              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#2C3E50",
                  display: { xs: "none", sm: "block" },
                }}
              >
                NOMIAI
              </Typography>
            </Box>

            {/* Navigation Links - Desktop */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component="a"
                  href={item.href}
                  sx={{
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "#64748b",
                    textTransform: "none",
                    px: 2.5,
                    py: 1,
                    borderRadius: "8px",
                    position: "relative",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#0f172a",
                      bgcolor: "rgba(15, 23, 42, 0.04)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: "50%",
                      bottom: 8,
                      transform: "translateX(-50%)",
                      width: "0%",
                      height: "2px",
                      bgcolor: "#1034A6",
                      transition: "width 0.25s ease",
                      borderRadius: "2px",
                    },
                    "&:hover::after": {
                      width: "60%",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Action Buttons - Desktop & Tablet */}
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1.5 }}>
              <Button
                href="/signin"
                variant="text"
                sx={{
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: "#64748b",
                  textTransform: "none",
                  px: { xs: 1.5, md: 2 },
                  py: 0.75,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#0f172a",
                    bgcolor: "rgba(15, 23, 42, 0.04)",
                  },
                }}
              >
                Sign in
              </Button>

              <Button
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={handleContactSales}
                sx={{
                  textTransform: "none",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  bgcolor: "#1034A6",
                  px: { xs: 2, md: 2.5 },
                  py: 0.875,
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(16, 52, 166, 0.2)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "#0d2b8f",
                    boxShadow: "0 4px 12px rgba(16, 52, 166, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                Contact Sales
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                display: { xs: "flex", sm: "none" },
                color: "#2C3E50",
                "&:hover": {
                  bgcolor: "rgba(44, 62, 80, 0.08)",
                },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: "280px",
            bgcolor: "#ffffff",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Drawer Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#2C3E50",
              }}
            >
              NOMIAI
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: "#64748b",
                "&:hover": {
                  bgcolor: "rgba(100, 116, 139, 0.08)",
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          {/* Navigation Links */}
          <List sx={{ px: 1, py: 2 }}>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  onClick={() => handleMobileNavClick(item.href)}
                  sx={{
                    borderRadius: "8px",
                    mb: 0.5,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "rgba(15, 23, 42, 0.04)",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                      color: "#475569",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Mobile Action Buttons */}
          <Box
            sx={{
              mt: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              borderTop: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <Button
              href="/signin"
              fullWidth
              variant="outlined"
              sx={{
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "#64748b",
                borderColor: "rgba(100, 116, 139, 0.3)",
                textTransform: "none",
                py: 1.25,
                borderRadius: "10px",
                "&:hover": {
                  borderColor: "#64748b",
                  bgcolor: "rgba(100, 116, 139, 0.04)",
                },
              }}
            >
              Sign in
            </Button>

            <Button
              fullWidth
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setMobileMenuOpen(false);
                handleContactSales();
              }}
              sx={{
                textTransform: "none",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#ffffff",
                bgcolor: "#1034A6",
                py: 1.25,
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(16, 52, 166, 0.2)",
                "&:hover": {
                  bgcolor: "#0d2b8f",
                  boxShadow: "0 4px 12px rgba(16, 52, 166, 0.3)",
                },
              }}
            >
              Contact Sales
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}