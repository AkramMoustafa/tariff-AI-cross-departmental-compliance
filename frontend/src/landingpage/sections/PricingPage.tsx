import React, { useState } from "react";
import { useClientSession } from "@/api/ClientSessionProvider";
import { usePaymentStatus } from "@/api/payment";
import {
  Box,
  Typography,
  Container,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

export default function PricingSection() {
  const SALES_EMAIL = "sales@nomioc.com";

  // Optional hooks - won't be available on landing page
  let paid = false;
  let session = null;
  let loading = false;
  let navigate: any = null;

  try {
    const paymentStatus = usePaymentStatus();
    paid = paymentStatus.paid;
  } catch (e) {
    // Provider not available
  }

  try {
    const clientSession = useClientSession();
    session = clientSession.session;
    loading = clientSession.loading;
  } catch (e) {
    // Provider not available
  }

  try {
    navigate = useNavigate();
  } catch (e) {
    // Not in router context
  }

  const isAuthenticated = session !== null;
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Plan data configuration
  const plans = [
    {
      name: "Essential",
      productKey: "essential_free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Perfect for exploring compliance capabilities",
      features: [
        "Up to 10 tariff calculations",
        "HS code validation & lookup",
        "Basic compliance dashboard",
        "Email support",
      ],
      highlighted: false,
      badge: null,
    },
    {
      name: "Perform",
      productKey: "perform",
      monthlyPrice: 6,
      yearlyPrice: 57.6,
      description: "Advanced tools for growing compliance teams",
      features: [
        "Up to 50 suppliers screened",
        "Unlimited tariff calculations",
        "Detailed breakdowns (232/301)",
        "PDF & CSV exports",
        "Priority support",
      ],
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      productKey: "enterprise_custom",
      price: "Custom",
      description: "Tailored solutions for complex global supply chains",
      features: [
        "Unlimited suppliers & users",
        "Custom dashboards & workflows",
        "Automated audit trails",
        "Dedicated account manager",
        "API integrations (ERP, Cloud)",
      ],
      highlighted: false,
      badge: null,
    },
  ];

  // Handle opening mailto link for contact sales
  const handleContactSales = (subject?: string, body?: string) => {
    const emailSubject = subject || "NomiAI Inquiry";
    const emailBody = body || "Hello Sales Team,\n\nI'm interested in learning more about NomiAI.\n\nBest regards,";

    const mailtoLink = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  // Handle plan selection click
  const handlePlanClick = (productKey: string) => {
    if (loading) return;

    // Enterprise plan - open email
    if (productKey === "enterprise_custom") {
      handleContactSales(
        "Enterprise Plan Inquiry",
        `Hello Sales Team,\n\nI'm interested in the Enterprise plan.\n\nCompany Name:\nEstimated suppliers:\nEstimated users:\nUse case:\n\nBest regards,`
      );
      return;
    }

    // Already paid - go to dashboard
    if (paid) {
      if (navigate) {
        navigate("/tariffs");
      } else {
        window.location.href = "/tariffs";
      }
      return;
    }

    // Not authenticated - go to signin
    if (!isAuthenticated) {
      if (navigate) {
        navigate("/signin", {
          state: { redirectTo: "/payment", productKey, billingCycle },
        });
      } else {
        window.location.href = "/signin";
      }
      return;
    }

    // Authenticated but not paid - go to payment
    if (navigate) {
      navigate("/payment", { state: { productKey, billingCycle } });
    } else {
      window.location.href = "/payment";
    }
  };

  return (
    <Box
      id="pricing"
      component="section"
      sx={{
        backgroundColor: "#f8fafc",
        py: { xs: 8, md: 14 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          background: "radial-gradient(circle at 20% 50%, rgba(16, 52, 166, 0.03) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3, md: 6 } }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 }, maxWidth: "42rem", mx: "auto", px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#0f172a",
              mb: 2,
              lineHeight: 1.2,
              fontFamily: "'Montserrat', -apple-system, sans-serif",
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.9375rem", md: "1.125rem" },
              color: "#64748b",
              lineHeight: 1.7,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Start free and expand as your trade volume grows. Every plan is built to reduce manual work, lower risk, and pay for itself in time and duty savings.
          </Typography>

          {/* Billing cycle toggle */}
          <Box
            sx={{
              display: "inline-flex",
              gap: 0.5,
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              p: 0.5,
              mt: { xs: 3, md: 4 },
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              flexWrap: "wrap",
              width: { xs: "100%", sm: "auto" },
              maxWidth: { xs: "320px", sm: "none" },
            }}
          >
            <Button
              onClick={() => setBillingCycle("monthly")}
              disableRipple
              sx={{
                flex: { xs: 1, sm: "0 1 auto" },
                px: { xs: 2, sm: 3 },
                py: 1,
                borderRadius: "10px",
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                fontWeight: 600,
                textTransform: "none",
                color: billingCycle === "monthly" ? "#ffffff" : "#64748b",
                backgroundColor: billingCycle === "monthly" ? "#1034A6" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: billingCycle === "monthly" ? "#0d2d8f" : "#f1f5f9",
                },
              }}
            >
              Monthly
            </Button>
            <Button
              onClick={() => setBillingCycle("yearly")}
              disableRipple
              sx={{
                flex: { xs: 1, sm: "0 1 auto" },
                px: { xs: 2, sm: 3 },
                py: 1,
                borderRadius: "10px",
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                fontWeight: 600,
                textTransform: "none",
                color: billingCycle === "yearly" ? "#ffffff" : "#64748b",
                backgroundColor: billingCycle === "yearly" ? "#1034A6" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: billingCycle === "yearly" ? "#0d2d8f" : "#f1f5f9",
                },
              }}
            >
              Yearly
              <Chip
                label="Save 20%"
                size="small"
                sx={{
                  ml: 1,
                  height: "20px",
                  fontSize: { xs: "0.625rem", sm: "0.7rem" },
                  fontWeight: 600,
                  backgroundColor: billingCycle === "yearly" ? "rgba(255,255,255,0.2)" : "#10b981",
                  color: "#ffffff",
                }}
              />
            </Button>
          </Box>
        </Box>

        {/* Pricing Cards Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 2, sm: 2.5, md: 3 },
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          {plans.map((plan) => (
            <Box
              key={plan.name}
              sx={{
                position: "relative",
                backgroundColor: plan.highlighted ? "#0f172a" : "#ffffff",
                borderRadius: { xs: "12px", md: "16px" },
                border: plan.highlighted ? "2px solid #1034A6" : "1px solid #e2e8f0",
                p: { xs: 3, sm: 3.5, md: 4 },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: { xs: "scale(1)", md: plan.highlighted ? "scale(1.05)" : "scale(1)" },
                boxShadow: plan.highlighted
                  ? "0 20px 40px rgba(16, 52, 166, 0.15)"
                  : "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  transform: { xs: "scale(1)", md: "scale(1.05)" },
                  boxShadow: plan.highlighted
                    ? "0 25px 50px rgba(16, 52, 166, 0.2)"
                    : "0 10px 30px rgba(0,0,0,0.08)",
                },
              }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <Chip
                    label={plan.badge}
                    size="small"
                    sx={{
                      backgroundColor: "#1034A6",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                      height: "24px",
                      px: 1,
                    }}
                  />
                </Box>
              )}

              {/* Current plan indicator */}
              {paid && plan.productKey === "perform" && (
                <Chip
                  label="Current Plan"
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                  }}
                />
              )}

              {/* Plan name */}
              <Typography
                sx={{
                  fontSize: { xs: "1.125rem", md: "1.25rem" },
                  fontWeight: 700,
                  color: plan.highlighted ? "#ffffff" : "#0f172a",
                  mb: 1,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {plan.name}
              </Typography>

              {/* Plan description */}
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  color: plan.highlighted ? "#cbd5e1" : "#64748b",
                  mb: { xs: 2.5, md: 3 },
                  lineHeight: 1.6,
                }}
              >
                {plan.description}
              </Typography>

              {/* Price display */}
              <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
                {plan.name === "Enterprise" ? (
                  <Typography
                    sx={{
                      fontSize: { xs: "2rem", md: "2.5rem" },
                      fontWeight: 800,
                      color: plan.highlighted ? "#ffffff" : "#0f172a",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Custom
                  </Typography>
                ) : (
                  <>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          fontWeight: 600,
                          color: plan.highlighted ? "#cbd5e1" : "#64748b",
                        }}
                      >
                        $
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: { xs: "2.5rem", md: "3rem" },
                          fontWeight: 800,
                          color: plan.highlighted ? "#ffffff" : "#0f172a",
                          lineHeight: 1,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {billingCycle === "monthly"
                          ? plan.monthlyPrice
                          : Math.floor(plan.yearlyPrice)}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          fontWeight: 500,
                          color: plan.highlighted ? "#cbd5e1" : "#64748b",
                          ml: 0.5,
                        }}
                      >
                        {billingCycle === "monthly" ? "/mo" : "/yr"}
                      </Typography>
                    </Box>
                    {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                      <Typography
                        sx={{
                          fontSize: { xs: "0.6875rem", md: "0.75rem" },
                          color: plan.highlighted ? "#94a3b8" : "#94a3b8",
                          mt: 0.5,
                        }}
                      >
                        ${plan.monthlyPrice}/mo billed annually
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              {/* CTA Button */}
              <Button
                fullWidth
                onClick={() => handlePlanClick(plan.productKey)}
                sx={{
                  py: { xs: 1.25, md: 1.5 },
                  borderRadius: "10px",
                  fontSize: { xs: "0.875rem", md: "0.9375rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  mb: { xs: 2.5, md: 3 },
                  backgroundColor: plan.highlighted ? "#ffffff" : "#1034A6",
                  color: plan.highlighted ? "#1034A6" : "#ffffff",
                  border: "2px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: plan.highlighted ? "#f1f5f9" : "#0d2d8f",
                    transform: { xs: "none", md: "translateY(-1px)" },
                    boxShadow: "0 4px 12px rgba(16, 52, 166, 0.2)",
                  },
                }}
              >
                {plan.productKey === "enterprise_custom"
                  ? "Contact Sales"
                  : paid
                    ? "Go to Dashboard"
                    : plan.monthlyPrice === 0
                      ? "Start Free"
                      : "Get Started"}
              </Button>

              {/* Feature list */}
              <Stack spacing={{ xs: 1.25, md: 1.5 }}>
                {plan.features.map((feature, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: { xs: 1.25, md: 1.5 },
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        fontSize: { xs: "1.125rem", md: "1.25rem" },
                        color: plan.highlighted ? "#10b981" : "#1034A6",
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        color: plan.highlighted ? "#e2e8f0" : "#475569",
                        lineHeight: 1.6,
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        {/* Bottom CTA section */}
        <Box
          sx={{
            textAlign: "center",
            mt: { xs: 8, md: 10 },
            pt: { xs: 6, md: 8 },
            borderTop: "1px solid #e2e8f0",
            px: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.125rem" },
              fontWeight: 600,
              color: "#0f172a",
              mb: 1,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Need a custom solution?
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.875rem", md: "0.9375rem" },
              color: "#64748b",
              mb: 3,
              maxWidth: "28rem",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Talk to our team about volume discounts, custom integrations, or dedicated support packages.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => handleContactSales()}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.25, md: 1.5 },
              borderRadius: "10px",
              fontSize: { xs: "0.875rem", md: "0.9375rem" },
              fontWeight: 600,
              textTransform: "none",
              borderColor: "#1034A6",
              color: "#1034A6",
              borderWidth: "2px",
              "&:hover": {
                borderWidth: "2px",
                borderColor: "#0d2d8f",
                backgroundColor: "rgba(16, 52, 166, 0.04)",
              },
            }}
          >
            Contact Sales
          </Button>
        </Box>
      </Container>
    </Box>
  );
}