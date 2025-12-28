// src/pages/LandingPage/sections/Features.tsx
import { Box, Container, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import FlashOnIcon from "@mui/icons-material/FlashOn";
import DescriptionIcon from "@mui/icons-material/Description";
import LockIcon from "@mui/icons-material/Lock";
import ShareIcon from "@mui/icons-material/Share";

const MotionBox = motion(Box);

export default function Features() {
    const featuresRef = useRef(null);
    const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

    const miniBars = [
        { color: "#1034A6", width: 96 },
        { color: "#1034A6", width: 64 },
        { color: "#f59e0b", width: 80 },
    ];

    const docs = [
        { name: "access_policy.pdf", status: "REVIEWED" },
        { name: "supplier_report.xlsx", status: "VERIFIED" },
        { name: "audit_report.pdf", status: "PENDING" },
    ];

    return (
        <Box
            id="features"
            ref={featuresRef}
            sx={{
                bgcolor: "#f8fafc",
                pt: { xs: 10, md: 16 },
                pb: { xs: 10, md: 16 },
            }}
        >
            <Container maxWidth="xl" sx={{ maxWidth: "80rem !important", px: 6 }}>
                {/* Header */}
                <MotionBox
                    initial={{ opacity: 0, y: 30 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7 }}
                    sx={{ textAlign: "center", mb: 12, maxWidth: "48rem", mx: "auto" }}
                >
                    <Typography
                        sx={{
                            fontSize: { xs: "1.875rem", md: "2.25rem" },
                            fontWeight: 600,
                            color: "#2C3E50",
                            letterSpacing: "-0.025em",
                            mb: 3,
                        }}
                    >
                        Complete compliance visibility
                    </Typography>

                    <Typography sx={{ fontSize: "1.125rem", color: "#64748b", lineHeight: 1.6 }}>
                        Everything you need to understand, manage, and prove compliance — in one intelligence platform.
                    </Typography>
                </MotionBox>

                {/* CSS Grid Layout */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                        gap: "1.5rem",
                        gridAutoRows: "minmax(300px, auto)",
                    }}
                >
                    {/* Large Card - Internal Auditing (spans 2 columns) */}
                    <MotionBox
                        initial={{ opacity: 0, y: 40 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.7 }}
                        sx={{
                            gridColumn: { xs: "1", md: "span 2" },
                            bgcolor: "#fff",
                            borderRadius: "16px",
                            p: 8,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
                        }}
                    >
                        <Box sx={{ position: "relative", zIndex: 10 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "8px",
                                    bgcolor: "rgba(16, 52, 166, 0.05)",
                                    color: "#1034A6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: "1.5rem",
                                    transition: "transform 0.3s ease",
                                    "&:hover": { transform: "scale(1.1)" },
                                }}
                            >
                                <FlashOnIcon sx={{ fontSize: 20 }} />
                            </Box>

                            <Typography
                                sx={{
                                    fontSize: "1.25rem",
                                    fontWeight: 600,
                                    letterSpacing: "-0.025em",
                                    color: "#2C3E50",
                                    mb: "0.5rem",
                                }}
                            >
                                Internal Auditing
                            </Typography>

                            <Typography sx={{ fontSize: "1rem", color: "#64748b", maxWidth: "28rem", lineHeight: 1.6 }}>
                                Automated obligation tracking across departments with real-time gap detection, also maps findings to
                                specific regulations and ownerships.
                            </Typography>
                        </Box>

                        {/* Decorative Element */}
                        <Box
                            sx={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: "33.333%",
                                height: "75%",
                                bgcolor: "#f8fafc",
                                border: "1px solid #f1f5f9",
                                borderTop: "1px solid #f1f5f9",
                                borderLeft: "1px solid #f1f5f9",
                                borderRadius: "16px 0 0 0",
                                p: 4,
                                transform: "translate(16px, 16px)",
                                transition: "transform 0.3s ease",
                                "&:hover": { transform: "translate(8px, 8px)" },
                            }}
                        >
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {miniBars.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 3,
                                            p: 2,
                                            borderRadius: "4px",
                                            border: "1px solid #f1f5f9",
                                            bgcolor: "#fff",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                                        <Box sx={{ height: 8, width: `${item.width}px`, borderRadius: "4px", bgcolor: "#f1f5f9" }} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </MotionBox>

                    {/* Tall Card - Supplier Onboarding (spans 2 rows) */}
                    <MotionBox
                        initial={{ opacity: 0, y: 40 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        sx={{
                            gridRow: { xs: "auto", md: "span 2" },
                            bgcolor: "#fff",
                            borderRadius: "16px",
                            p: "2rem",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                            transition: "all 0.3s ease",
                            "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "8px",
                                bgcolor: "rgba(16, 52, 166, 0.05)",
                                color: "#1034A6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: "1.5rem",
                            }}
                        >
                            <DescriptionIcon sx={{ fontSize: 20 }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                letterSpacing: "-0.025em",
                                color: "#2C3E50",
                                mb: "0.5rem",
                            }}
                        >
                            Supplier Onboarding
                        </Typography>

                        <Typography sx={{ fontSize: "1rem", color: "#64748b", mb: "1.5rem", lineHeight: 1.6 }}>
                            Risk scored vendor compliance assessment before contract approval and recommends better better-performing
                            alternative when compliance gaps are detected.
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {docs.map((doc, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        p: "0.5rem",
                                        borderRadius: "4px",
                                        border: "1px solid #f1f5f9",
                                        bgcolor: "#f8fafc",
                                    }}
                                >
                                    <DescriptionIcon sx={{ fontSize: 16, color: "#94a3b8" }} />

                                    <Typography
                                        sx={{
                                            fontFamily: "monospace",
                                            fontSize: "0.75rem",
                                            color: "#475569",
                                        }}
                                    >
                                        {doc.name}
                                    </Typography>

                                    <Box sx={{ ml: "auto" }}>
                                        <Typography
                                            sx={{
                                                fontSize: "0.625rem",
                                                fontWeight: 700,
                                                color: "#1034A6",
                                                bgcolor: "#dbeafe",
                                                px: "0.375rem",
                                                py: "0.125rem",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            {doc.status}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </MotionBox>

                    {/* Small Card - Ownership & Accountability */}
                    <MotionBox
                        initial={{ opacity: 0, y: 40 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: "16px",
                            p: "2rem",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                            transition: "all 0.3s ease",
                            minHeight: 300,
                            "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "8px",
                                bgcolor: "rgba(16, 52, 166, 0.05)",
                                color: "#1034A6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: "1.5rem",
                            }}
                        >
                            <LockIcon sx={{ fontSize: 20 }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                letterSpacing: "-0.025em",
                                color: "#2C3E50",
                                mb: "0.5rem",
                            }}
                        >
                            Ownership &amp; Accountability
                        </Typography>

                        <Typography sx={{ fontSize: "1rem", color: "#64748b", lineHeight: 1.6, mb: "1rem" }}>
                            Assign responsibility for controls, documents, and gaps across teams and departments.
                        </Typography>
                    </MotionBox>

                    {/* Small Card - Cross Department */}
                    <MotionBox
                        initial={{ opacity: 0, y: 40 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: "16px",
                            p: "2rem",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                            transition: "all 0.3s ease",
                            minHeight: 300,
                            "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "8px",
                                bgcolor: "rgba(16, 52, 166, 0.05)",
                                color: "#1034A6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: "1.5rem",
                            }}
                        >
                            <ShareIcon sx={{ fontSize: 20 }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                letterSpacing: "-0.025em",
                                color: "#2C3E50",
                                mb: "0.5rem",
                            }}
                        >
                            Cross department
                        </Typography>

                        <Typography sx={{ fontSize: "1rem", color: "#64748b", lineHeight: 1.6, mb: "1rem" }}>
                            Multiple department impact visualization through knowledge graphs.
                        </Typography>
                    </MotionBox>
                </Box>
            </Container>
        </Box>
    );
}
