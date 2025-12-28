// src/pages/LandingPage/sections/Comparison.tsx
import { Box, Container, Grid, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const MotionBox = motion(Box);

export default function Comparison() {
    const comparisonRef = useRef(null);
    const comparisonInView = useInView(comparisonRef, { once: true, margin: "-100px" });

    const items = [
        {
            title: "Fragmented evidence",
            description: "Compliance data scattered across documents, teams, and suppliers.",
            type: "negative",
        },
        {
            title: "No single source of truth",
            description: "Conflicting versions and outdated information hide real risk.",
            type: "negative",
        },
        {
            title: "Unified with NomiAI",
            description: "All compliance data is structured, connected, and visible in one intelligence platform.",
            type: "positive",
        },
    ];

    const blurredLineWidths = [100, 75, 83];

    const bars = [
        { label: "Infrastructure", width: "100%" },
        { label: "Identity", width: "92%" },
    ];

    return (
        <Box
            ref={comparisonRef}
            sx={{
                borderTop: "1px solid #f1f5f9",
                borderBottom: "1px solid #f1f5f9",
                pt: { xs: 10, md: 16 },
                pb: { xs: 10, md: 16 },
                bgcolor: "#fff",
            }}
        >
            <Container maxWidth="xl" sx={{ maxWidth: "80rem !important", px: { xs: 3, md: 6 } }}>
                <Grid container spacing={12} alignItems="center">
                    {/* Left side */}
                    <Grid item xs={12} lg={6}>
                        <MotionBox
                            initial={{ opacity: 0, x: -30 }}
                            animate={comparisonInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 0.7 }}
                        >
                            <Typography
                                sx={{
                                    fontSize: { xs: "1.875rem", md: "2.25rem" },
                                    fontWeight: 600,
                                    color: "#2C3E50",
                                    letterSpacing: "-0.025em",
                                    mb: 4,
                                }}
                            >
                                Stop chasing screenshots
                            </Typography>

                            <Typography sx={{ fontSize: "1.125rem", lineHeight: 1.6, color: "#64748b", mb: 6 }}>
                                The traditional way of compliance involves Data fragmented across spreadsheets, emails, and
                                applications. <strong>NomiAI</strong> acts as a streamlined platform.
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                {items.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            gap: 4,
                                            ...(index === 2 ? { pt: 3, borderTop: "1px solid #f1f5f9" } : {}),
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                flexShrink: 0,
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mt: 0.5,
                                                bgcolor: item.type === "positive" ? "rgba(16, 52, 166, 0.1)" : "#fef3c7",
                                                color: item.type === "positive" ? "#1034A6" : "#d97706",
                                            }}
                                        >
                                            {item.type === "positive" ? (
                                                <CheckIcon sx={{ fontSize: 14 }} />
                                            ) : (
                                                <CloseIcon sx={{ fontSize: 14 }} />
                                            )}
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#2C3E50", mb: 0.5 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </MotionBox>
                    </Grid>

                    {/* Right side */}
                    <Grid item xs={12} lg={6}>
                        <MotionBox
                            initial={{ opacity: 0, x: 30 }}
                            animate={comparisonInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                            transition={{ duration: 0.7 }}
                            sx={{ position: "relative" }}
                        >
                            <Box
                                sx={{
                                    borderRadius: "16px",
                                    p: 8,
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                                    bgcolor: "#f8fafc",
                                    position: "relative",
                                }}
                            >
                                {/* Risk Card */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        right: -16,
                                        top: -16,
                                        p: 4,
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                        border: "1px solid #e2e8f0",
                                        maxWidth: 200,
                                        transform: "rotate(3deg)",
                                        zIndex: 10,
                                        bgcolor: "#fff",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f59e0b" }} />
                                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>
                                            Audit Risk
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                                        Evidence missing for 3 controls.
                                    </Typography>
                                </Box>

                                {/* Blurred Lines */}
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, opacity: 0.6, filter: "blur(1px)" }}>
                                    {blurredLineWidths.map((w, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                height: 32,
                                                width: `${w}%`,
                                                borderRadius: "4px",
                                                border: "1px solid #e2e8f0",
                                                bgcolor: "#fff",
                                            }}
                                        />
                                    ))}
                                </Box>

                                {/* Clean Card */}
                                <Box
                                    sx={{
                                        mt: 8,
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                        border: "1px solid #e2e8f0",
                                        overflow: "hidden",
                                        transform: "scale(1)",
                                        transition: "transform 0.5s ease",
                                        "&:hover": { transform: "scale(1.02)" },
                                        bgcolor: "#fff",
                                    }}
                                >
                                    {/* Header */}
                                    <Box
                                        sx={{
                                            px: 4,
                                            py: 3,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            bgcolor: "#2C3E50",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#fff" }}>
                                            nomiai_monitor_active
                                        </Typography>

                                        <Box sx={{ display: "flex", gap: 1.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#475569" }} />
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#475569" }} />
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#475569" }} />
                                        </Box>
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ p: 5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#2C3E50" }}>
                                                Control Status
                                            </Typography>

                                            <Box
                                                sx={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700,
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: "50px",
                                                    color: "#1034A6",
                                                    bgcolor: "#dbeafe",
                                                }}
                                            >
                                                98% PASSING
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                            {bars.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    <Typography sx={{ color: "#64748b" }}>{item.label}</Typography>

                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            mx: 3,
                                                            height: 6,
                                                            borderRadius: "50px",
                                                            overflow: "hidden",
                                                            bgcolor: "#f1f5f9",
                                                        }}
                                                    >
                                                        <Box sx={{ height: "100%", width: item.width, borderRadius: "50px", bgcolor: "#2C3E50" }} />
                                                    </Box>

                                                    <Typography sx={{ color: "#64748b" }}>{item.width}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </MotionBox>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
