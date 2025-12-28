import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

    const goHome = () => navigate("/");
    const goToDashboard = () => navigate("/dashboard");

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#0f172a",
                color: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 3,
            }}
        >
            <Box
                sx={{
                    maxWidth: 480,
                    textAlign: "center",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "5rem",
                        fontWeight: 800,
                        color: "#6366f1",
                        mb: 1,
                    }}
                >
                    404
                </Typography>
                <Typography
                    sx={{
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#f9fafb",
                        mb: 2,
                    }}
                >
                    Page not found
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.95rem",
                        color: "#9ca3af",
                        mb: 4,
                        lineHeight: 1.7,
                    }}
                >
                    The page you are looking for doesn’t exist or may have been moved.
                    Use the links below to get back on track.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={goHome}
                        sx={{
                            bgcolor: "#6366f1",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            "&:hover": { bgcolor: "#4f46e5" },
                        }}
                    >
                        Go to Homepage
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={goToDashboard}
                        sx={{
                            borderColor: "#4b5563",
                            color: "#e5e7eb",
                            textTransform: "none",
                            fontWeight: 500,
                            px: 3,
                            "&:hover": {
                                borderColor: "#9ca3af",
                                bgcolor: "rgba(148,163,184,0.1)",
                            },
                        }}
                    >
                        Open Dashboard
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
