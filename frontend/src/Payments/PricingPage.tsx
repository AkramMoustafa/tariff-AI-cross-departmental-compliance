import Footer from "../landing page/sections/Footer"
import Navbar from "../landing page/sections/Navbar"
import { useClientSession } from "@/api/ClientSessionProvider";
import React, { useState, useEffect } from "react";
import { usePaymentStatus } from "@/api/payment";

import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

export default function PricingPage() {
const SALES_EMAIL = "sales@nomioc.com";
  const { paid } = usePaymentStatus();
  const { session, loading } = useClientSession();
const isAuthenticated = session !== null;
  const navigate = useNavigate();
const [billingCycle, setBillingCycle] =
  useState<"monthly" | "yearly">("monthly"); [paid, isAuthenticated, navigate];
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
const MONTHLY_PRICE = 6;
const YEARLY_PRICE = MONTHLY_PRICE * 12 * 0.8; 
const plans = [
  {
    name: "Essential",

    productKey: "essential_free",
    monthlyPrice: 0,
    yearlyPrice: 0,
      description: "Ideal for small supply chains and new compliance teams.",
      features: [
        { label: "Accurate tariff calculations", included: true },
        { label: "Up to 5–10 tariff calculations", included: true },
        { label: "HS code validation & lookup", included: true },
        { label: "Detailed breakdowns (232 / 301)", included: false },
          { label: "PDF & CSV exports", included: false },
      ],
      highlighted: false,
    },
    {
    name: "Perform",
    productKey: "perform",
    monthlyPrice: 6,
    yearlyPrice: 6 * 12 * 0.8,
      description: "Best for mid-sized supply chains and proactive compliance monitoring.",
      features: [
        { label: "Up to 50 suppliers screened", included: true },
        { label: "Unlimited tariff calculations", included: true },
        { label: "Detailed breakdowns (232 / 301)", included: true },
        { label: "PDF & CSV exports", included: true },
      ],
      highlighted: false,
 
    },
    {
      name: "Enterprise",
      productKey: "enterprise_custom",
      price: "Custom",
      description: "For large supply chains with global compliance challenges.",
      features: [
        { label: "Unlimited suppliers and users", included: true },
        { label: "Region/industry custom dashboards", included: true },
        { label: "Automated audits & remediation workflows", included: true },
        { label: "Dedicated onboarding & support", included: true },
        { label: "Competitive insights across multiple geographies", included: true },
      ],
      highlighted: true,
    },
  ];

  const comparison = [
    {
      feature: "Suppliers Tracked",
      Essential: "Up to 10",
      Perform: "Up to 50",
      Enterprise: "Unlimited",
    },
    {
      feature: "Compliance Dashboard",
      Essential: "Basic",
      Perform: "Full",
      Enterprise: "Custom",
    },
    {
      feature: "Automated Document Retrieval",
      Essential: true,
      Perform: true,
      Enterprise: true,
    },
    {
      feature: "Risk & Evidence Reporting",
      Essential: false,
      Perform: true,
      Enterprise: true,
    },
    {
      feature: "Competitor Intelligence Alerts",
      Essential: false,
      Perform: true,
      Enterprise: true,
    },
    {
      feature: "API Integrations (ERP, Cloud)",
      Essential: false,
      Perform: true,
      Enterprise: true,
    },
    {
      feature: "Custom Dashboards",
      Essential: false,
      Perform: false,
      Enterprise: true,
    },
    {
      feature: "Dedicated Support",
      Essential: false,
      Perform: true,
      Enterprise: true,
    },
  ];
  

const handlePlanClick = (productKey: string) => {
  if (loading) return; // ⛔ wait until session is known

  if (!isAuthenticated) {
    navigate("/signin", {
      state: {
        redirectTo: "/payment",
        productKey,
        billingCycle,
      },
    });
    return;
  }

  navigate("/payment", {
    state: {
      productKey,
      billingCycle,
    },
  });
};

  return (
    <>
      {/* 🔹 Pricing Section */}
     <Navbar scrolled={scrolled} />
<Box
  sx={{
    backgroundColor: "#f9fafc",
    minHeight: "100vh",
    pt: "96px", // space for navbar
    pb: 6,
    px: { xs: 3, md: 10 },
  }}
>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "#2C3E50",
              mb: 1,
            }}
          >
            Pricing & Plans
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              color: "rgba(0,0,0,0.7)",
              maxWidth: "600px",
              mx: "auto",
              mb: 4,
            }}
          >
            Every account starts with limited free access. Choose a plan when you need higher usage, detailed tariff breakdowns, and compliance tools.
          </Typography>

          {/* Toggle buttons */}
          <Box
            sx={{
              display: "inline-flex",
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Button
              onClick={() => setBillingCycle("monthly")}
              disableRipple
              sx={{
                px: 3,
                py: 1,
                borderRadius: "10px",
                color: billingCycle === "monthly" ? "#fff" : "#333",
                backgroundColor:
                  billingCycle === "monthly" ?"#1034A6" : "transparent",
                textTransform: "none",
                fontWeight: 600,

                "&:hover": {
                  backgroundColor:
                    billingCycle === "monthly" ? "#1034A6" : "transparent",
                },
              }}
            >
              Monthly
            </Button>
           <Button
              onClick={() => setBillingCycle("yearly")}
              disableRipple
              sx={{
                px: 3,
                py: 1,
                borderRadius: "10px",
                color: billingCycle === "yearly" ? "#fff" : "#333",
                backgroundColor:
                  billingCycle === "yearly" ? "#1034A6" : "transparent",
                textTransform: "none",
                fontWeight: 600,

                "&:hover": {
                  backgroundColor:
                    billingCycle === "yearly" ? "#1034A6" : "transparent",
                },
              }}
            >
              Yearly
              <Typography ml={1} sx={{ opacity: 0.7 }}>
                –20%
              </Typography>
            </Button>
          </Box>
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.name}>
              
              <Card
                sx={{
                  height: "100%",
                  borderRadius: "10px",
boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
"&:hover": {
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
},
                backgroundColor: plan.highlighted ? "#0f172a" : "#fff",
                color: "#2C3E50",
                border: plan.highlighted
                  ? "1px solid rgba(59,130,246,0.6)"
                  : "1px solid #e2e8f0",
                  transition: "all 0.3s ease",

                }}
              >


               <Box sx={{ p: "2rem" }}>
                  <Typography
  sx={{
    fontSize: "1.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
    color: plan.highlighted ? "#cbd5f5" : "#2C3E50",
  }}
>
                    {plan.name}
                  </Typography>
                  {paid && plan.productKey === "perform" && (
  <Chip
    label="Current Plan"
    size="small"
    sx={{
      mt: 1,
      mb: 1,
      fontWeight: 600,
    }}
  />
)}

                  {/* Price */}
              <Typography
  sx={{
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
color: plan.highlighted ? "#e5e7eb" : "#0f172a",

  }}
>
                {plan.name === "Enterprise"
                  ? "Custom"
                  : billingCycle === "monthly"
                  ? `$${plan.monthlyPrice}`
                  : `$${plan.yearlyPrice.toFixed(0)}`}
              </Typography>

              {plan.name !== "Enterprise" && (
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    color: plan.highlighted
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(0,0,0,0.6)",
                  }}
                >
                  {billingCycle === "monthly"
                    ? "per month"
                    : "per year (20% off)"}
                </Typography>
              )}

                  <Typography
                    sx={{
                      color: plan.highlighted
                        ? "rgba(255,255,255,0.8)"
                        : "rgba(0,0,0,0.6)",
                      mb: 2,
                      fontSize: "0.95rem",
                    }}
                  >
                    {plan.description}
                  </Typography>
                  
<Button
  variant="contained"
  fullWidth
  onClick={() => {
    if (plan.productKey === "enterprise_custom") {
      const subject = encodeURIComponent("Enterprise Plan Inquiry");
      const body = encodeURIComponent(
        `Hello Sales Team,

I'm interested in the Enterprise plan.

Company Name:
Estimated number of suppliers:
Estimated users:
Use case:

Best regards,`
      );

      window.location.href = `mailto:sales@nomioc.com?subject=${subject}&body=${body}`;
      return;
    }

    // ✅ PAID → GO TO DASHBOARD
    if (paid) {
      navigate("/tariffs"); // change route if needed
      return;
    }

    // 💳 NOT PAID → PAYMENT FLOW
    handlePlanClick(plan.productKey);
  }}
  sx={{
    color: "#fff",
    fontWeight: 600,
    textTransform: "none",
    borderRadius: "5px",
    py: 1.2,
    mb: 3,
    backgroundColor: "#1034A6",
    "&:hover": { backgroundColor: "#0b2d91" },
  }}
>
  {plan.productKey === "enterprise_custom"
    ? "Contact Sales"
    : paid
    ? "Go to Dashboard"
    : "Purchase Plan"}
</Button>


                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" mb={1.5} fontWeight={600}>
                    Includes:
                  </Typography>
                  {plan.features.map((feature, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      {feature.included ? (
                        <CheckCircleIcon
                          sx={{
                            fontSize: "1.1rem",
                            mr: 1,
                            color: "#1034A6",
                          }}
                        />
                      ) : (
                        <CloseIcon
                          sx={{
                            fontSize: "1.1rem",
                            mr: 1,
                            color: "#cbd5e1",
                          }}
                        />
                      )}

                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          color: feature.included
                            ? plan.highlighted
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(0,0,0,0.75)"
                            : "rgba(0,0,0,0.45)",
                        }}
                      >
                        {feature.label}
                      </Typography>
                    </Box>
                  ))}

                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Box>

      {/* 🔹 Footer */}
      <Footer />
    </>
  );
}
