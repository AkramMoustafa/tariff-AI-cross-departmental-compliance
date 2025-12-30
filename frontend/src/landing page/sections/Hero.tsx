// src/pages/LandingPage/sections/Hero.tsx
import { Box, Button, Container, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Hero images
import heroSectionImg from "../../assets/herosection.jpeg";
import heroSectionImg2x from "../../assets/herosection@2x.jpg";

const MotionBox = motion(Box);
const MotionLink = motion.a;

type Props = {
    onBookDemo: () => void;
    onWatchDemo: () => void;
    spotlightHref: string;
};

export default function Hero({ onBookDemo, onWatchDemo, spotlightHref }: Props) {
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    return (
        <Box
            ref={heroRef}
            component="main"
            sx={{
                pt: { xs: 16, md: 24 },
                pb: { xs: 8, md: 16 },
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
                    {/* Spotlight pill */}
                    <MotionLink
                        href="https://www.linkedin.com/posts/activity-7411440836309090304-_yiF?utm_source=share&utm_medium=member_desktop&rcm=ACoAADy7kgsBCzDh9cWWeRE0qplqwG841BAqqPQ"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 8 }}
                        animate={
                            heroInView
                                ? {
                                    opacity: 1,
                                    y: 0,
                                    boxShadow: [
                                        "0 6px 18px rgba(15,23,42,0.06)",
                                        "0 12px 28px rgba(16,52,166,0.14)",
                                        "0 6px 18px rgba(15,23,42,0.06)",
                                    ],
                                }
                                : { opacity: 0, y: 8 }
                        }
                        transition={{
                            duration: 0.55,
                            delay: 0.05,
                            boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 },
                        }}
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            WebkitTapHighlightColor: "transparent",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                            paddingLeft: "12px",
                            paddingRight: "12px",
                            paddingTop: "6px",
                            paddingBottom: "6px",
                            borderRadius: "999px",
                            textDecoration: "none",
                            cursor: "pointer",
                            backgroundColor: "rgba(255,255,255,0.82)",
                            border: "1px solid rgba(226,232,240,0.95)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                        }}
                    >
                        {/* Ping dot */}
                        <Box sx={{ position: "relative", width: 8, height: 8 }}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: "999px",
                                    bgcolor: "#1034A6",
                                    opacity: 0.35,
                                    animation: "spotlightPing 1.35s cubic-bezier(0,0,0.2,1) infinite",
                                    "@keyframes spotlightPing": {
                                        "0%": { transform: "scale(1)", opacity: 0.45 },
                                        "75%": { transform: "scale(2.2)", opacity: 0 },
                                        "100%": { transform: "scale(2.2)", opacity: 0 },
                                    },
                                }}
                            />
                            <Box sx={{ position: "relative", width: 8, height: 8, borderRadius: "999px", bgcolor: "#1034A6" }} />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#475569",
                                letterSpacing: "0.01em",
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Spotlight: Why Compliance is Broken
                        </Typography>

                        {/* Click-me arrow */}
                        <MotionBox
                            aria-hidden
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                            sx={{ display: "inline-flex", alignItems: "center", ml: 0.25, color: "#1034A6" }}
                        >
                            <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                        </MotionBox>
                    </MotionLink>
                    {/* Main Headline */}
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: "2.1rem", sm: "2.6rem", md: "4.5rem" },
                                fontWeight: 600,
                                lineHeight: 1.12,
                                color: "#2C3E50",
                                letterSpacing: "-0.04em",
                                mb: { xs: 2.5, md: 4 },
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
                                fontSize: { xs: "1.02rem", md: "1.25rem" },
                                fontWeight: 400,
                                lineHeight: 1.6,
                                color: "#64748b",
                                maxWidth: "50rem",
                                mx: "auto",
                                mb: { xs: 5, md: 8 },
                            }}
                        >
                            Unifies internal policies, supplier evidence, and regulatory and market data into one AI-powered compliance
                            graph, act before risks become headlines.
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
                                gap: { xs: 1.5, sm: 3 },
                                mb: { xs: 6, md: 12 },
                            }}
                        >
                            <Button
                                onClick={onBookDemo}
                                endIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                                fullWidth
                                sx={{
                                    width: { xs: "100%", sm: "auto" },
                                    maxWidth: { xs: 420, sm: "none" },
                                    textTransform: "none",
                                    fontSize: { xs: "0.95rem", sm: "0.875rem" },
                                    fontWeight: 700,
                                    color: "#fff",
                                    bgcolor: "#1034A6",
                                    px: { xs: 3, sm: 5 },
                                    py: { xs: 1.6, sm: 1.5 },
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
                                fullWidth
                                sx={{
                                    width: { xs: "100%", sm: "auto" },
                                    maxWidth: { xs: 420, sm: "none" },
                                    textTransform: "none",
                                    fontSize: { xs: "0.95rem", sm: "0.875rem" },
                                    fontWeight: 700,
                                    color: "#334155",
                                    bgcolor: "#fff",
                                    px: { xs: 3, sm: 5 },
                                    py: { xs: 1.6, sm: 1.5 },
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

                    {/* Hero image */}
                    <MotionBox
                        initial={{ opacity: 0, y: 50 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        sx={{
                            position: "relative",
                            mt: 0,
                            width: "100%",
                            maxWidth: "80rem",
                            mx: "auto",
                        }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                borderRadius: { xs: "16px", md: "22px" },
                                p: { xs: 0.5, md: 1 },
                                background:
                                    "linear-gradient(135deg, rgba(16,52,166,0.40), rgba(44,62,80,0.10), rgba(16,52,166,0.26))",
                                boxShadow: "0 28px 80px rgba(15,23,42,0.18)",
                            }}
                        >
                            <Box
                                sx={{
                                    borderRadius: { xs: "12px", md: "18px" },
                                    overflow: "hidden",
                                    bgcolor: "#fff",
                                    border: { xs: "1px solid rgba(226,232,240,0.6)", md: "1px solid rgba(226,232,240,0.95)" },
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={heroSectionImg}
                                    srcSet={`${heroSectionImg} 1x, ${heroSectionImg2x} 2x`}
                                    sizes="100vw"
                                    alt="ComplianceAI platform preview"
                                    loading="eager"
                                    decoding="async"
                                    sx={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block",
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