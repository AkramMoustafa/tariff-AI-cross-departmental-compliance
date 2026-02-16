// src/pages/LandingPage/LandingPage.tsx
import { Box } from "@mui/material";
import { useEffect, useState } from "react";

import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import CompliancePainPoints from "./sections/CompliancePainPoints";
import ComplianceWorkflow from "./sections/ComplianceWorkflow";
import Features from "./sections/Features";
import Comparison from "./sections/Comparison";
import Pricing from "./sections/PricingPage";
import Footer from "./sections/Footer";


import BookDemoDialog from "./dialogs/BookDemoDialog";
import WatchDemoDialog from "./dialogs/WatchDemoDialog";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  const [openBookDemo, setOpenBookDemo] = useState(false);
  const [openWatchDemo, setOpenWatchDemo] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box id="home" sx={{ bgcolor: "#ffffff", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Navbar scrolled={scrolled} />

      <Hero onBookDemo={() => setOpenBookDemo(true)} onWatchDemo={() => setOpenWatchDemo(true)} />

      <CompliancePainPoints />
      <ComplianceWorkflow />
      <Features />
      <Comparison />
      <Pricing />
      <Footer />

      <BookDemoDialog open={openBookDemo} onClose={() => setOpenBookDemo(false)} />
      <WatchDemoDialog open={openWatchDemo} onClose={() => setOpenWatchDemo(false)} />
    </Box>
  );
}

