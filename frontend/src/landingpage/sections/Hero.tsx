// src/pages/LandingPage/sections/Hero.tsx
import { Box, Button, Container, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { motion, useInView } from "framer-motion";
import React, { useRef,useState, useEffect } from "react";
import earth from "../../assets/EARTH.mp4";

// Hero images
import heroSectionImg from "../../assets/finalherosection.png";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";

import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const handleGoToSignup = () => {
        navigate("/signin");
    };
const [step, setStep] = useState(0);

useEffect(() => {
  const sequence = [0, 1, 2, 3, 4];
  let i = 0;

  const interval = setInterval(() => {
    i = (i + 1) % sequence.length;
    setStep(sequence[i]);
  }, 1500);

  return () => clearInterval(interval);
}, []);

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
                        onClick={() => navigate("/supply_chain_disruption")}
                        
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
                            Explore Supply Chain Disruption
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
                            Real-Time Trade Compliance, Embedded in Procurement
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
                            Validate every purchase order against tariffs, sanctions, and global trade rules before approval.
                        </Typography>
                    </MotionBox>


               

                    <Box
                    sx={{
                        borderRadius: 0,
                        border: "none",
                        boxShadow: "none",
                        bgcolor: "transparent",
                         mb: { xs: 4, md: 6 } // 👈 add this
                    }}
                    ><Box sx={{ position: "relative", mb: { xs: 4, md: 6 } }}>
                                <Box
                                component="video"
                                src={earth}
                                autoPlay
                                muted
                                loop
                                playsInline
                                sx={{
                                    width: "100%",
                                    height: "100%",          // 🔑 key change
                                    display: "block",
                                    objectFit: "cover",      // keeps it cropped nicely
                                     borderRadius: "12px",
                                     filter: "brightness(0.85)",
                                }}
                                />
                                  {/* OVERLAY LAYER */}
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
    }}
  >
    {step >= 1 && (
  <MotionBox
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    sx={{
      position: "absolute",
      top: 20,
      left: 20,
      bgcolor: "rgba(255,255,255,0.9)",
      color: "#1e293b",
      px: 1.2,
      py: 0.5,
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: 500,
    }}
  >
    Route detected: US → EU
  </MotionBox>
)}
    <MotionBox
  key={step >= 4 ? "approved" : "validating"}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  sx={{
    position: "absolute",
    bottom: 20,
    left: 20,
    bgcolor: step === 4 ? "#16A34A" : "rgba(15,23,42,0.75)",
    color: "white",
    px: 1.5,
    py: 0.75,
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.1)",
  }}
>
  {step === 4 ? "✔ Approved" : "Validating tariffs..."}
</MotionBox>
</Box>
                            </Box>
                           </Box>
                            
                        </Box>
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
                                onClick={handleGoToSignup}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    color: "#ffffff",
                                    bgcolor: "#1034A6",
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(16, 52, 166, 0.25), 0 2px 4px rgba(16, 52, 166, 0.15)",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        bgcolor: "#0d2a85",
                                        boxShadow: "0 6px 20px rgba(16, 52, 166, 0.35), 0 3px 6px rgba(16, 52, 166, 0.2)",
                                        transform: "translateY(-1px)",
                                    },
                                    "&:active": {
                                        transform: "translateY(0px)",
                                        boxShadow: "0 2px 8px rgba(16, 52, 166, 0.2)",
                                    },
                                }}
                            >
                                Get Started
                            </Button>
                        </Box>
                    </MotionBox>


            </Container>
        </Box>
    );
}