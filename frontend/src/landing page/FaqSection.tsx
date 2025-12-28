// src/pages/LandingPage/sections/FaqSection.tsx
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

type FaqItem = { q: string; a: ReactNode };

const ChevronDown = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const B = ({ children }: { children: ReactNode }) => (
    <Box component="span" sx={{ fontWeight: 800, color: "#334155" }}>
        {children}
    </Box>
);

export default function FaqSection() {
    const faqs: FaqItem[] = [
        {
            q: "What is NomiAI?",
            a: (
                <>
                    <B>NomiAI is an AI-powered supply chain copilot</B> designed specifically for small and mid-sized
                    manufacturers. We turn your scattered policies, supplier lists, and complex regulations into a{" "}
                    <B>single, unified intelligence graph</B>. Instead of manually chasing updates across jurisdictions,{" "}
                    <B>NomiAI monitors your supply chain in real time</B>, alerting you to risks <B>before they become disruptions</B>.
                </>
            ),
        },
        {
            q: "Does NomiAI replace my compliance team?",
            a: (
                <>
                    <B>Absolutely not.</B> NomiAI is a <B>force multiplier, not a replacement.</B> We automate the low-level
                    grind—<B>repetitive monitoring, document parsing, and initial supplier scoring</B>—so your experts can focus on{" "}
                    <B>high-value judgment calls.</B> NomiAI clears the noise and surfaces the signal.{" "}
                    <B>Your team retains full control over every decision,</B> but they make those decisions{" "}
                    <B>faster, with better data, and with significantly less stress.</B>
                </>
            ),
        },
        {
            q: "How secure is my data?",
            a: (
                <>
                    <B>Security is the foundation of our architecture, not an afterthought.</B> NomiAI is built to{" "}
                    <B>SOC 2 standards,</B> utilizing <B>strict data isolation and enterprise-grade encryption.</B> Critically,
                    we protect your intellectual property by using <B>proprietary in-house AI models.</B> Unlike tools that rely
                    on public APIs, <B>your sensitive supplier data is never exposed to public models.</B> With NomiAI,{" "}
                    <B>your data remains strictly yours.</B>
                </>
            ),
        },
        {
            q: "How do I get started?",
            a: (
                <>
                    <B>See exactly how NomiAI handles your supply chain.</B> We don’t believe in generic sales pitches.{" "}
                    <B>Book a live consultation</B> where we map your current suppliers and workflows against relevant regulations
                    to show you the <B>immediate impact</B> NomiAI can have on your business. Ready to streamline your compliance?
                    Email us directly at{" "}
                    <Box
                        component="a"
                        href="mailto:nomiochelp@gmail.com"
                        sx={{ color: "#1034A6", fontWeight: 800, textDecoration: "none" }}
                    >
                        nomiochelp@gmail.com
                    </Box>
                    .
                </>
            ),
        },
    ];

    return (
        <Box
            sx={{
                maxWidth: "48rem",
                mx: "auto",
                px: { xs: 3, md: 6 },
                py: "35px", // ✅ 35px padding top and bottom
            }}
        >
            <Box sx={{ textAlign: "center", mb: 8 }}>
                <Typography sx={{ fontSize: "1.875rem", fontWeight: 600, color: "#2C3E50", mb: 2, letterSpacing: "-0.02em" }}>
                    Frequently Asked Questions
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "1.125rem" }}>
                    Everything you need to know about the NomiAI platform.
                </Typography>
            </Box>

            <Box sx={{ display: "grid", gap: 2 }}>
                {faqs.map((item, idx) => (
                    <Box
                        key={idx}
                        component="details"
                        sx={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            overflow: "hidden",
                            backgroundColor: "rgba(248,250,252,0.4)",
                            transition: "all 0.3s ease",
                            "&[open]": {
                                backgroundColor: "#fff",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                            },
                        }}
                    >
                        <Box
                            component="summary"
                            sx={{
                                listStyle: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                                p: 2.5,
                                color: "#2C3E50",
                                fontWeight: 600,
                                "&::-webkit-details-marker": { display: "none" },
                            }}
                        >
                            <span>{item.q}</span>

                            <Box
                                sx={{
                                    width: 20,
                                    height: 20,
                                    color: "#94a3b8",
                                    transition: "transform 0.3s ease",
                                    "details[open] &": { transform: "rotate(180deg)" },
                                }}
                            >
                                {ChevronDown}
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                px: 2.5,
                                pb: 2.5,
                                pt: 0.5,
                                borderTop: "1px solid transparent",
                                "details[open] &": { borderTopColor: "#f1f5f9" },
                                color: "#64748b",
                                fontSize: "0.875rem",
                                lineHeight: 1.7,
                            }}
                        >
                            {item.a}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
