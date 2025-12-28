// src/pages/LandingPage/dialogs/BookDemoDialog.tsx
import { Box, Dialog, Divider, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useEffect } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
};

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

export default function BookDemoDialog({ open, onClose }: Props) {
    const calendlyUrl =
        import.meta.env.VITE_BOOK_DEMO_CALENDLY_URL ??
        "https://calendly.com/vasundharashelke0328/30min";

    useEffect(() => {
        if (!open) return;

        const win = window as typeof window & {
            Calendly?: { initInlineWidget: (opts: { url: string; parentElement: Element }) => void };
        };

        const initWidget = () => {
            setTimeout(() => {
                const container = document.querySelector(".calendly-inline-widget");
                if (container && win.Calendly) {
                    container.innerHTML = "";
                    win.Calendly.initInlineWidget({ url: calendlyUrl, parentElement: container });
                }
            }, 100);
        };

        if (win.Calendly) {
            initWidget();
            return;
        }

        if (document.querySelector(`script[src="${CALENDLY_SCRIPT_SRC}"]`)) {
            const interval = setInterval(() => {
                if (win.Calendly) {
                    clearInterval(interval);
                    initWidget();
                }
            }, 100);

            return () => clearInterval(interval);
        }

        const s = document.createElement("script");
        s.src = CALENDLY_SCRIPT_SRC;
        s.async = true;
        s.onload = () => initWidget();
        document.body.appendChild(s);
    }, [open, calendlyUrl]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                    maxHeight: "90vh",
                },
            }}
        >
            {/* PASTE the BOOK DEMO Dialog JSX from landingpage.tsx here.
          Important: keep the element with className="calendly-inline-widget" */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: { xs: "auto", md: 750 } }}>
                {/* Left Panel - paste from original */}
                <Box sx={{ width: { xs: "100%", md: 360 }, bgcolor: "#fff", p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: "#2C3E50" }}>Schedule a Demo</Typography>
                    </Box>

                    <Typography sx={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
                        Book a 30-minute session with our solution engineering team.
                    </Typography>

                    <Divider sx={{ borderColor: "#eef2f7" }} />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <CheckIcon sx={{ color: "#1034A6", mt: "2px", fontSize: 18 }} />
                            <Box>
                                <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.875rem" }}>
                                    Personalized Walkthrough
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                                    We'll focus on your specific compliance frameworks (ISO, SOC2, NIST).
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <CalendarMonthIcon sx={{ color: "#1034A6", mt: "2px", fontSize: 18 }} />
                            <Box>
                                <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.875rem" }}>
                                    30 Minutes
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                                    Short, high-impact session. No fluff.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: "auto", pt: 2 }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Timezone: Auto-detected</Typography>
                    </Box>
                </Box>

                {/* Right Panel - Calendly (must keep className) */}
                <Box sx={{ flex: 1, bgcolor: "#fff", position: "relative", display: "block", minHeight: { xs: 700, md: 750 } }}>
                    <Box className="calendly-inline-widget" data-url={calendlyUrl} sx={{ minWidth: 320, height: "100%" }} />
                </Box>
            </Box>
        </Dialog>
    );
}
