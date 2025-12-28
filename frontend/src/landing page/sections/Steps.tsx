// src/pages/LandingPage/sections/Steps.tsx
import { Box, Container, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const MotionBox = motion(Box);

export default function Steps() {
    const stepsRef = useRef(null);
    const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" });

    const steps = [
        {
            number: 1,
            title: "Onboard and connect",
            description:
                "Authenticate your team, onboard suppliers, and connect document sources to pull policies, contracts, and certifications into NomiAI.",
        },
        {
            number: 2,
            title: "Analyze with AI",
            description:
                "NomiAI’s RAG engine and correlation layer map your documents to regulations and competitor activity, assign similarity-based compliance scores, and generate plain-language gap narratives.",
        },
        {
            number: 3,
            title: "Create tasks and obligations",
            description:
                "Turn findings into obligations and tasks linked to departments, owners, and suppliers, and track status from TODO to Done with attached evidence.",
        },
        {
            number: 4,
            title: "Monitor and benchmark",
            description:
                "Dashboards aggregate audits, high-risk gaps, and framework coverage, while market-aware benchmarking shows where you’re ahead or behind peers.",
        },
    ];

    return (
        <Box
            ref={stepsRef}
            sx={{
                pt: { xs: 10, md: 16 },
                pb: { xs: 10, md: 16 },
                bgcolor: "#f8fafc",
            }}
        >
            <Container maxWidth="md" sx={{ px: { xs: 3, md: 6 } }}>
                <MotionBox
                    initial={{ opacity: 0, y: 30 }}
                    animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7 }}
                >
                    <Typography
                        sx={{
                            fontSize: "1.875rem",
                            fontWeight: 600,
                            textAlign: "center",
                            mb: 12,
                            letterSpacing: "-0.025em",
                            color: "#2C3E50",
                        }}
                    >
                        Audit readiness in 4 steps
                    </Typography>
                </MotionBox>

                <Box sx={{ position: "relative" }}>
                    {/* Vertical Line */}
                    <Box
                        sx={{
                            position: "absolute",
                            left: 24,
                            top: 24,
                            bottom: 24,
                            width: 2,
                            bgcolor: "#e2e8f0",
                        }}
                    />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {steps.map((step, index) => (
                            <MotionBox
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                                sx={{
                                    position: "relative",
                                    pl: 16,
                                    "&:hover .step-number": {
                                        borderColor: "#1034A6",
                                        bgcolor: "#1034A6",
                                        color: "#fff",
                                    },
                                }}
                            >
                                <Box
                                    className="step-number"
                                    sx={{
                                        position: "absolute",
                                        left: 0,
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        border: "1px solid #e2e8f0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                        zIndex: 10,
                                        transition: "all 0.3s ease",
                                        color: "#2C3E50",
                                        bgcolor: "#fff",
                                    }}
                                >
                                    {step.number}
                                </Box>

                                <Typography sx={{ fontSize: "1.125rem", fontWeight: 500, color: "#2C3E50", mb: 2 }}>
                                    {step.title}
                                </Typography>

                                <Typography sx={{ fontSize: "1rem", lineHeight: 1.6, color: "#64748b" }}>
                                    {step.description}
                                </Typography>
                            </MotionBox>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
