import { Box, Container, Typography, Chip } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import DescriptionIcon from "@mui/icons-material/Description";
import LockIcon from "@mui/icons-material/Lock";
import ShareIcon from "@mui/icons-material/Share";

const MotionBox = motion(Box);

export default function Features() {
    const featuresRef = useRef(null);
    const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

const purchaseOrders = [
    { name: "PO-1045.pdf", risk: "HIGH" },
    { name: "PO-2041.pdf", risk: "MEDIUM" },
    { name: "PO-3321.pdf", risk: "LOW" },
];

    return (
        <Box
            id="features"
            ref={featuresRef}
            sx={{
                bgcolor: "#f8fafc",
                background: "radial-gradient(circle at 50% 0%, #f1f5f9 0%, #f8fafc 50%)",
                pt: { xs: 8, md: 16 },
                pb: { xs: 8, md: 16 },
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background decoration */}
            <Box
                sx={{
                    position: "absolute",
                    top: { xs: -50, md: -100 },
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "100%",
                    maxWidth: "1200px",
                    height: { xs: "400px", md: "600px" },
                    background: "radial-gradient(50% 50% at 50% 50%, rgba(16, 52, 166, 0.03) 0%, rgba(255, 255, 255, 0) 100%)",
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />
            <Container maxWidth="xl" sx={{ maxWidth: "80rem !important", px: { xs: 2, sm: 4, md: 6 } }}>
                {/* Header */}
                <MotionBox
                    initial={{ opacity: 0, y: 30 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7 }}
                    sx={{
                        textAlign: "center",
                        mb: { xs: 6, md: 12 },
                        maxWidth: "48rem",
                        mx: "auto",
                        position: "relative",
                        zIndex: 1,
                        px: { xs: 2, sm: 0 }
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
                            fontWeight: 700,
                            color: "#0f172a",
                            letterSpacing: "-0.025em",
                            mb: { xs: 2, md: 3 },
                            lineHeight: 1.1,
                        }}
                    >
                       Real-Time Purchase Order Risk Intelligence
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: { xs: "1rem", md: "1.125rem" },
                            color: "#64748b",
                            lineHeight: 1.6,
                            px: { xs: 1, sm: 0 }
                        }}
                    >
                        Upload a purchase order and instantly predict delays, financial exposure, and recommended actions.
                    </Typography>
                </MotionBox>

                {/* Grid Layout */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                        gap: { xs: "1rem", md: "1.5rem" },
                        gridAutoRows: "minmax(280px, auto)",
                    }}
                >
                    {/* Tall Card - Supplier Onboarding */}
                    <MotionBox
                        initial={{ opacity: 0, y: 40 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        sx={{
                            gridRow: { xs: "auto", md: "span 2" },
                            bgcolor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(12px)",
                            borderRadius: { xs: "16px", md: "24px" },
                            p: { xs: 3, sm: 4, md: 5 },
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                                transform: { xs: "none", md: "translateY(-4px)" },
                                boxShadow: {
                                    xs: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
                                    md: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)"
                                },
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: 36, md: 40 },
                                height: { xs: 36, md: 40 },
                                borderRadius: "8px",
                                bgcolor: "rgba(16, 52, 166, 0.05)",
                                color: "#1034A6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: { xs: "1rem", md: "1.5rem" },
                            }}
                        >
                            <DescriptionIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: { xs: "1.25rem", md: "1.5rem" },
                                fontWeight: 600,
                                letterSpacing: "-0.025em",
                                color: "#0f172a",
                                mb: "0.75rem",
                            }}
                        >
                            Purchase Order Risk Analysis
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: { xs: "0.9375rem", md: "1rem" },
                                color: "#64748b",
                                mb: { xs: "1.5rem", md: "2rem" },
                                lineHeight: 1.7
                            }}
                        >
                            Real-time prediction of delays, financial exposure, and recommended mitigation strategies for each purchase order.
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "0.75rem", md: "1rem" } }}>
                           {purchaseOrders.map((po, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: { xs: "0.75rem", md: "1rem" },
                                        p: { xs: "0.625rem 0.875rem", md: "0.75rem 1rem" },
                                        borderRadius: { xs: "10px", md: "12px" },
                                        border: "1px solid #f1f5f9",
                                        bgcolor: "#fff",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            borderColor: "#e2e8f0",
                                            transform: { xs: "none", md: "translateX(4px)" },
                                            boxShadow: { xs: "none", md: "0 2px 4px rgba(0,0,0,0.02)" },
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: { xs: 28, md: 32 },
                                            height: { xs: 28, md: 32 },
                                            borderRadius: "8px",
                                            bgcolor: "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <DescriptionIcon sx={{ fontSize: { xs: 16, md: 18 }, color: "#64748b" }} />
                                    </Box>

                                    <Typography
                                        sx={{
                                            fontFamily: "monospace",
                                            fontSize: { xs: "0.75rem", md: "0.8125rem" },
                                            color: "#334155",
                                            fontWeight: 500,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {po.name}
                                    </Typography>

                                    <Box sx={{ ml: "auto", flexShrink: 0 }}>
                                     <Typography
                                        sx={{
                                            fontSize: "0.625rem",
                                            fontWeight: 700,
                                            color:
                                                po.risk === "HIGH"
                                                    ? "#dc2626"
                                                    : po.risk === "MEDIUM"
                                                    ? "#b45309"
                                                    : "#166534",
                                            bgcolor:
                                                po.risk === "HIGH"
                                                    ? "#fee2e2"
                                                    : po.risk === "MEDIUM"
                                                    ? "#fef3c7"
                                                    : "#dcfce7",
                                            px: "0.5rem",
                                            py: "0.25rem",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        {po.risk}
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
                            bgcolor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(12px)",
                            borderRadius: { xs: "16px", md: "24px" },
                            p: { xs: 3, sm: 4, md: 5 },
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            minHeight: { xs: 240, md: 300 },
                            "&:hover": {
                                transform: { xs: "none", md: "translateY(-4px)" },
                                boxShadow: {
                                    xs: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
                                    md: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)"
                                },
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: 36, md: 40 },
                                height: { xs: 36, md: 40 },
                                borderRadius: "8px",
                                bgcolor: "rgba(16, 52, 166, 0.05)",
                                color: "#1034A6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: { xs: "1rem", md: "1.5rem" },
                            }}
                        >
                            <LockIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: { xs: "1.25rem", md: "1.5rem" },
                                fontWeight: 600,
                                letterSpacing: "-0.025em",
                                color: "#0f172a",
                                mb: "0.75rem",
                            }}
                        >
                           Financial Impact
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: { xs: "0.9375rem", md: "1rem" },
                                color: "#64748b",
                                lineHeight: 1.6,
                                mb: "1rem"
                            }}
                        >
                            Breakdown of financial exposure caused by predicted disruption.
                        </Typography>
                    </MotionBox>

                    {/* Small Card - Cross Department */}
                    <MotionBox
                        initial={{ opacity: 0, y: 40 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        sx={{
                            bgcolor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(12px)",
                            borderRadius: { xs: "16px", md: "24px" },
                            p: { xs: 3, sm: 4, md: 5 },
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            minHeight: { xs: 240, md: 300 },
                            "&:hover": {
                                transform: { xs: "none", md: "translateY(-4px)" },
                                boxShadow: {
                                    xs: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
                                    md: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)"
                                },
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: 36, md: 40 },
                                height: { xs: 36, md: 40 },
                                borderRadius: "8px",
                                bgcolor: "rgba(16, 52, 166, 0.05)",
                                color: "#1034A6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: { xs: "1rem", md: "1.5rem" },
                            }}
                        >
                            <ShareIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: { xs: "1.25rem", md: "1.5rem" },
                                fontWeight: 600,
                                letterSpacing: "-0.025em",
                                color: "#0f172a",
                                mb: "0.75rem",
                            }}
                        >
                           What-If Simulation
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: { xs: "0.9375rem", md: "1rem" },
                                color: "#64748b",
                                lineHeight: 1.6,
                                mb: "1rem"
                            }}
                        >Simulate alternative decisions and instantly evaluate risk reduction.
                        </Typography>
                    </MotionBox>
                </Box>
            </Container>
        </Box>
    );
}