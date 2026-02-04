import { Box, Paper, Typography } from "@mui/material";

export default function SignIn1() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f7f8fa",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 420,
          height: 320,
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          Sign In
        </Typography>
      </Paper>
    </Box>
  );
}
