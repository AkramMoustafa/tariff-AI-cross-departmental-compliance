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
            title: "Save 10x Money and Time with NomAI Intelligence Layer",
            description: "Automated AI auditing finds tariff errors, reduces manual work, and uncovers savings opportunities in minutes instead of weeks.",
            type: "positive",
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
                pt: { xs: 8, md: 16 },
                pb: { xs: 8, md: 16 },
                bgcolor: "#fff",
            }}
        >
            <Container maxWidth="xl" sx={{ maxWidth: "80rem !important", px: { xs: 2, sm: 3, md: 6 } }}>
                <Grid container spacing={{ xs: 6, md: 12 }} alignItems="center">
                    {/* Left side */}
                    <Grid item xs={12} lg={6}>
                        <MotionBox
                            initial={{ opacity: 0, x: -30 }}
                            animate={comparisonInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 0.7 }}
                        >
                            <Typography
                                sx={{
                                    fontSize: { xs: "1.75rem", sm: "1.875rem", md: "2.25rem" },
                                    fontWeight: 600,
                                    color: "#2C3E50",
                                    letterSpacing: "-0.025em",
                                    mb: { xs: 3, md: 4 },
                                    lineHeight: 1.2,
                                }}
                            >
                                Stop chasing screenshots
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: { xs: "1rem", md: "1.125rem" },
                                    lineHeight: 1.6,
                                    color: "#64748b",
                                    mb: { xs: 4, md: 6 }
                                }}
                            >
                                The traditional way of compliance involves Data fragmented across spreadsheets, emails, and
                                applications. <strong>NomiAI</strong> acts as a streamlined platform.
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3.5, md: 5 } }}>
                                {items.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            gap: { xs: 2.5, md: 4 },
                                            ...(index === 2 ? { pt: { xs: 2.5, md: 3 }, borderTop: "1px solid #f1f5f9" } : {}),
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                flexShrink: 0,
                                                width: { xs: 20, md: 24 },
                                                height: { xs: 20, md: 24 },
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
                                                <CheckIcon sx={{ fontSize: { xs: 12, md: 14 } }} />
                                            ) : (
                                                <CloseIcon sx={{ fontSize: { xs: 12, md: 14 } }} />
                                            )}
                                        </Box>

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "0.8125rem", md: "0.875rem" },
                                                    fontWeight: 500,
                                                    color: "#2C3E50",
                                                    mb: 0.5,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "0.8125rem", md: "0.875rem" },
                                                    color: "#64748b",
                                                    lineHeight: 1.6
                                                }}
                                            >
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
                                    borderRadius: { xs: "12px", md: "16px" },
                                    p: { xs: 2.5, sm: 4, md: 8 },
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                                    bgcolor: "#f8fafc",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {/* Risk Card */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        mb: 3,
                                        p: { xs: 2, sm: 2.5, md: 4 },
                                        borderRadius: { xs: "10px", md: "12px" },
                                        boxShadow: {
                                            xs: "0 4px 12px rgba(0,0,0,0.08)",
                                            md: "0 10px 25px rgba(0,0,0,0.1)"
                                        },
                                        border: "1px solid #e2e8f0",
                                        width: "100%",
                                        maxWidth: { xs: "100%", sm: "85%", md: 200 },
                                        ml: { xs: 0, md: "auto" },
                                        mr: { xs: 0, md: -2 },
                                        transform: { xs: "none", md: "rotate(3deg)" },
                                        zIndex: 10,
                                        bgcolor: "#fff",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 }, mb: 1.5 }}>
                                        <Box sx={{ width: { xs: 6, md: 8 }, height: { xs: 6, md: 8 }, borderRadius: "50%", bgcolor: "#f59e0b" }} />
                                        <Typography
                                            sx={{
                                                fontSize: { xs: "0.6875rem", md: "0.75rem" },
                                                fontWeight: 600,
                                                color: "#334155"
                                            }}
                                        >
                                            Audit Risk
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: "0.6875rem", md: "0.75rem" },
                                            color: "#64748b",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Evidence missing for 3 controls.
                                    </Typography>
                                </Box>

                                {/* Blurred Lines */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: { xs: 2, md: 3 },
                                        opacity: 0.6,
                                        filter: "blur(1px)"
                                    }}
                                >
                                    {blurredLineWidths.map((w, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                height: { xs: 24, md: 32 },
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
                                        mt: { xs: 4, sm: 6, md: 8 },
                                        borderRadius: { xs: "10px", md: "12px" },
                                        boxShadow: {
                                            xs: "0 6px 20px rgba(0,0,0,0.08)",
                                            md: "0 10px 40px rgba(0,0,0,0.1)"
                                        },
                                        border: "1px solid #e2e8f0",
                                        overflow: "hidden",
                                        transform: "scale(1)",
                                        transition: "transform 0.5s ease",
                                        "&:hover": {
                                            transform: { xs: "scale(1)", md: "scale(1.02)" }
                                        },
                                        bgcolor: "#fff",
                                    }}
                                >
                                    {/* Header */}
                                    <Box
                                        sx={{
                                            px: { xs: 2.5, sm: 3, md: 4 },
                                            py: { xs: 1.75, sm: 2, md: 3 },
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            bgcolor: "#2C3E50",
                                            gap: 2,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                                                fontFamily: "monospace",
                                                color: "#fff",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                minWidth: 0,
                                            }}
                                        >
                                            nomiai_monitor_active
                                        </Typography>

                                        <Box sx={{ display: "flex", gap: { xs: 1, md: 1.25 }, flexShrink: 0 }}>
                                            <Box sx={{ width: { xs: 6, md: 8 }, height: { xs: 6, md: 8 }, borderRadius: "50%", bgcolor: "#475569" }} />
                                            <Box sx={{ width: { xs: 6, md: 8 }, height: { xs: 6, md: 8 }, borderRadius: "50%", bgcolor: "#475569" }} />
                                            <Box sx={{ width: { xs: 6, md: 8 }, height: { xs: 6, md: 8 }, borderRadius: "50%", bgcolor: "#475569" }} />
                                        </Box>
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ p: { xs: 2.5, sm: 3, md: 5 } }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                mb: { xs: 3, md: 4 },
                                                gap: 2,
                                                flexWrap: { xs: "wrap", sm: "nowrap" },
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "0.8125rem", md: "0.875rem" },
                                                    fontWeight: 500,
                                                    color: "#2C3E50"
                                                }}
                                            >
                                                Control Status
                                            </Typography>

                                            <Box
                                                sx={{
                                                    fontSize: { xs: "0.6875rem", md: "0.75rem" },
                                                    fontWeight: 700,
                                                    px: { xs: 1.5, md: 2 },
                                                    py: { xs: 0.75, md: 1 },
                                                    borderRadius: "50px",
                                                    color: "#1034A6",
                                                    bgcolor: "#dbeafe",
                                                    flexShrink: 0,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                98% PASSING
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
                                            {bars.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        fontSize: { xs: "0.6875rem", md: "0.75rem" },
                                                        gap: { xs: 1.5, md: 2 },
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: "#64748b",
                                                            minWidth: { xs: 72, md: 92 },
                                                            fontSize: { xs: "0.6875rem", md: "0.75rem" },
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            height: { xs: 5, md: 6 },
                                                            borderRadius: "50px",
                                                            overflow: "hidden",
                                                            bgcolor: "#f1f5f9",
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                height: "100%",
                                                                width: item.width,
                                                                borderRadius: "50px",
                                                                bgcolor: "#2C3E50",
                                                                transition: "width 0.5s ease",
                                                            }}
                                                        />
                                                    </Box>

                                                    <Typography
                                                        sx={{
                                                            color: "#64748b",
                                                            width: { xs: 40, md: 48 },
                                                            textAlign: "right",
                                                            flexShrink: 0,
                                                            fontSize: { xs: "0.6875rem", md: "0.75rem" },
                                                        }}
                                                    >
                                                        {item.width}
                                                    </Typography>
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