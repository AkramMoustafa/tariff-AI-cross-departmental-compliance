import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./landing page/landingpage";
import SignIn from "./dashboard/SignIn";
import SignUp from "./dashboard/SignUp";
import NotFoundPage from "./landing page/NotFoundPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { RootRedirect } from "./compliance_team/routes";
import ComplianceApp from "./compliance_team/ComplianceApp";

export default function App() {
  return (
    <Box>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Role-based redirect */}
        <Route path="/redirect" element={<RootRedirect />} />

        {/* NEW Compliance App */}
        <Route
          path="/compliance/*"
          element={
            <ProtectedRoute>
              <ComplianceApp />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Box>
  );
}
