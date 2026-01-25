import { Routes, Route } from "react-router-dom";

import ControlOwnerLayout from "./ControlOwnerLayout";
import ControlOwnerDashboard from "./ControlOwnerDashboard";
import EvidenceTasksPage from "./EvidenceTasksPage";
import ControlExecutionsPage from "./ControlExecutionsPage";

export default function ControlOwnerApp() {
  return (
    <Routes>
      <Route element={<ControlOwnerLayout />}>
        {/* /control_owner */}
        <Route index element={<ControlOwnerDashboard />} />

        {/* /control_owner/evidence */}
        <Route path="evidence" element={<EvidenceTasksPage />} />

        {/* /control_owner/executions */}
        <Route path="executions" element={<ControlExecutionsPage />} />
      </Route>
    </Routes>
  );
}