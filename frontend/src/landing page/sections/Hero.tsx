// src/pages/LandingPage/sections/Hero.tsx
import { Box, Button, Container, Typography } from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// New hero image (from: src/assets/herosection.jpeg)
import heroSectionImg from "../../assets/herosection.jpeg";

const MotionBox = motion(Box);

type Props = {
    onBookDemo: () => void;
    onWatchDemo: () => void;
};

export default function Hero({ onBookDemo, onWatchDemo }: Props) {
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    return (
        <Box
            ref={heroRef}
            component="main"
            sx={{
                pt: { xs: 20, md: 28 },
                pb: { xs: 10, md: 16 },
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Grid Background */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundSize: "40px 40px",
                    backgroundImage:
                        "linear-gradient(to right, rgba(44, 62, 80, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(44, 62, 80, 0.08) 1px, transparent 1px)",
                    maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* Decorative Blob */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "100%",
                    maxWidth: "48rem",
                    height: "24rem",
                    filter: "blur(80px)",
                    zIndex: 0,
                    borderRadius: "50%",
                    opacity: 0.25,
                    bgcolor: "rgba(16, 52, 166, 0.2)",
                }}
            />

            <Container
                maxWidth="xl"
                sx={{
                    maxWidth: "80rem !important",
                    px: { xs: 3, md: 6 },
                    position: "relative",
                    zIndex: 10,
                }}
            >
                <Box sx={{ textAlign: "center" }}>
                    {/* Main Headline */}
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: "2.5rem", md: "4.5rem" },
                                fontWeight: 600,
                                lineHeight: 1.1,
                                color: "#2C3E50",
                                letterSpacing: "-0.04em",
                                mb: 4,
                                mx: "auto",
                            }}
                        >
                            AI Compliance Intelligence for Enterprises &amp; Supply Chains
                        </Typography>
                    </MotionBox>

                    {/* Subtitle */}
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: "1.125rem", md: "1.25rem" },
                                fontWeight: 400,
                                lineHeight: 1.6,
                                color: "#64748b",
                                maxWidth: "50rem",
                                mx: "auto",
                                mb: 8,
                            }}
                        >
                            Unifies internal policies, supplier evidence, and regulatory and market data into one AI-powered compliance graph, act
                            before risks become headlines.
                        </Typography>
                    </MotionBox>

                    {/* CTA Buttons */}
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 3,
                                mb: 12,
                            }}
                        >
                            <Button
                                onClick={onBookDemo}
                                endIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#fff",
                                    bgcolor: "#1034A6",
                                    px: 5,
                                    py: 1.5,
                                    borderRadius: "10px",
                                    boxShadow: "0 10px 25px rgba(16,52,166,0.25)",
                                    border: "1px solid rgba(16,52,166,0.25)",
                                    "&:hover": { bgcolor: "#003D82" },
                                }}
                            >
                                Book Demo
                            </Button>

                            <Button
                                onClick={onWatchDemo}
                                startIcon={<PlayArrowRoundedIcon />}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    bgcolor: "#fff",
                                    px: 5,
                                    py: 1.5,
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                                }}
                            >
                                Watch Demo
                            </Button>
                        </Box>
                    </MotionBox>

                    {/* NEW: Hero image */}
                    <MotionBox
                        initial={{ opacity: 0, y: 50 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        sx={{ maxWidth: "80rem", mx: "auto", position: "relative" }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                borderRadius: "22px",
                                p: { xs: 0.75, md: 1 },
                                background:
                                    "linear-gradient(135deg, rgba(16,52,166,0.40), rgba(44,62,80,0.10), rgba(16,52,166,0.26))",
                                boxShadow: "0 28px 80px rgba(15,23,42,0.18)",
                                transition: "transform 200ms ease, box-shadow 200ms ease",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 38px 100px rgba(15,23,42,0.22)",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    borderRadius: "18px",
                                    overflow: "hidden",
                                    bgcolor: "#fff",
                                    border: "1px solid rgba(226,232,240,0.95)",
                                    width: "100%",
                                    aspectRatio: { xs: "4 / 3", md: "16 / 9" },
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={heroSectionImg}
                                    alt="ComplianceAI platform preview"
                                    loading="eager"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            </Box>
                        </Box>
                    </MotionBox>


                </Box>
            </Container>
        </Box>
    );
}
