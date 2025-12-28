import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./landing page/landingpage";
import DashboardApp from "./dashboard/DashboardApp";
import SignIn from "./dashboard/SignIn";
import SignUp from "./dashboard/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundPage from "./landing page/NotFoundPage";

export default function App() {
  return (
    <Box>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardApp />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Box>
  );
}
