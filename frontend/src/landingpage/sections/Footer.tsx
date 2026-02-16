// src/pages/LandingPage/sections/Footer.tsx
import { Box, Container, IconButton, Typography } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import RedditIcon from "@mui/icons-material/Reddit";
import { Link as RouterLink } from "react-router-dom";

const LINKEDIN_URL = "https://www.linkedin.com/company/nomiai-compliance";
const TWITTER_URL = "https://x.com/Nomi_Compliance?s=20";
const REDDIT_URL = "https://www.reddit.com/r/NomiAI_Compliance/";

// TODO: replace with your real GitHub org/repo link when ready
// const GITHUB_URL = "#";

export default function Footer() {
    return (
        <Box component="footer" sx={{ borderTop: "1px solid #f1f5f9", bgcolor: "#fff" }}>
            <Container maxWidth="xl" sx={{ maxWidth: "80rem !important", px: { xs: 3, md: 6 } }}>
                <Box
                    sx={{
                        py: { xs: 6, md: 7 },
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 3, sm: 2 },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                    }}
                >
                    {/* Brand */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.875rem",
                                    fontWeight: 800,
                                    bgcolor: "#2C3E50",
                                    color: "#fff",
                                }}
                            >
                                N
                            </Box>

                            <Typography sx={{ fontWeight: 800, letterSpacing: "-0.03em", color: "#2C3E50" }}>
                                NOMIAI
                            </Typography>
                        </Box>

                        <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#64748b", maxWidth: "32rem" }}>
                            AI-powered tariff intelligence that helps enterprises cut duty costs and avoid overpayment.
                        </Typography>

                        <Typography sx={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                            © 2026 NomiAI LLC. All rights reserved.
                        </Typography>
                    </Box>

                    {/* Social */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <IconButton
                            aria-label="Reddit"
                            component="a"
                            href={REDDIT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                color: "#FF4500", // Reddit orange
                                "&:hover": {
                                    color: "#FF4500",
                                    bgcolor: "#fff5f0",
                                    borderColor: "#ffb199",
                                },
                            }}
                        >
                            <RedditIcon sx={{ fontSize: 22 }} />
                        </IconButton>


                        <IconButton
                            aria-label="X (Twitter)"
                            component="a"
                            href={TWITTER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                color: "#0077B5", // Twitter Blue
                                "&:hover": {
                                    color: "#FFFFFF",
                                    bgcolor: "#0077B5",
                                    borderColor: "#0077B5",
                                },
                            }}
                        >
                            <TwitterIcon sx={{ fontSize: 22 }} />
                        </IconButton>

                        <IconButton
                            aria-label="LinkedIn"
                            component="a"
                            href={LINKEDIN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                color: "#1DA1F2", // LinkedIn Blue
                                "&:hover": {
                                    color: "#FFFFFF",
                                    bgcolor: "#1DA1F2",
                                    borderColor: "#1DA1F2",
                                },
                            }}
                        >
                            <LinkedInIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
