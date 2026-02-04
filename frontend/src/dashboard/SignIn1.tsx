import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Divider,
  Paper,
} from "@mui/material";

export default function Login() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #fde7f3 0%, #e6f0ff 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 520,              
          p: 5,
          backgroundColor: "transparent",
          boxShadow: "none",
          textAlign: "center",
        }}
      >
        <Stack spacing={3}>
          {/* Logo */}
          <Box sx={{ fontSize: 28, fontWeight: 700 }}>
            NOMIAI
          </Box>

          {/* Heading */}
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don’t have an account?{" "}
              <Typography
                component="span"
                sx={{ color: "#2563eb", cursor: "pointer" }}
              >
                Sign up
              </Typography>
            </Typography>
          </Box>

          <Divider>or</Divider>

          {/* EMAIL */}
        <TextField
                fullWidth
                label="Work email"
                placeholder="name@company.com"
                variant="outlined"
                sx={{
                    "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "rgba(255,255,255,0.7)",
                    transition: "all 0.2s ease",

                    "& fieldset": {
                        borderColor: "#d1d5db",
                    },

                    "&:hover fieldset": {
                        borderColor: "#9ca3af",
                    },

                    "&.Mui-focused fieldset": {
                        borderColor: "#2563eb",
                        borderWidth: 2,
                    },
                    },

                    "& .MuiInputBase-input": {
                    padding: "10px 14px", // 👈 SHORTER FIELD
                    fontSize: "1rem",
                    },

                    "& .MuiInputLabel-root": {
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    },

                    "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2563eb",
                    },
                }}
                />

                        {/* EMAIL */}
                        <TextField
                fullWidth
                label="Password"
                placeholder="Enter your password"
                variant="outlined"
                sx={{
                    "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "rgba(255,255,255,0.7)",
                    transition: "all 0.2s ease",

                    "& fieldset": {
                        borderColor: "#d1d5db",
                    },

                    "&:hover fieldset": {
                        borderColor: "#9ca3af",
                    },

                    "&.Mui-focused fieldset": {
                        borderColor: "#2563eb",
                        borderWidth: 2,
                    },
                    },

                    "& .MuiInputBase-input": {
                    padding: "10px 14px", 
                    fontSize: "1rem",
                    },

                    "& .MuiInputLabel-root": {
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    },

                    "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2563eb",
                    },
                }}
                />


          {/* LOGIN BUTTON */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              py: 1,              // 👈 TALLER BUTTON
              fontSize: "1rem",
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Log in
          </Button>

          {/* FOOTER */}
          <Typography
            variant="body2"
            sx={{ color: "#2563eb", cursor: "pointer" }}
          >
            Forgot password?
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
