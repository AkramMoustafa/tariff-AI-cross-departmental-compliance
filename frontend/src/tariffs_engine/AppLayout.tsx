import { Box } from "@mui/material";
import Sidebar from "./sidebar";

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flex: 1,   // 👈 this is all you need
        
        }}
      >
        {children}
      </Box>
    </Box>
  );
}