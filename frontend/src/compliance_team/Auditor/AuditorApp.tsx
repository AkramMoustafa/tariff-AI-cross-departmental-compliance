import { Routes, Route } from "react-router-dom";
import AuditorLayout from "./AuditorLayout";
import AuditorDashboard from "./AuditorDashboard";
import EvidenceRequestsPage from "./EvidenceRequestsPage";

export default function AuditorApp() {
  return (
    <Routes>
      <Route element={<AuditorLayout />}>
        <Route index element={<AuditorDashboard />} />
        <Route path="evidence" element={<EvidenceRequestsPage />} />
      </Route>
    </Routes>
  );
}