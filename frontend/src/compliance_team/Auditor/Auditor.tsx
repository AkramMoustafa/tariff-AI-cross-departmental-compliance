import { Routes, Route } from "react-router-dom";

import { ComplianceLayout } from "../Compliance_owner/ComplianceLayout";
import { ComplianceDashboard } from "../Compliance_owner/ComplianceDashboard";
import { ExecutiveCompliancePanel } from "../Compliance_owner/AuditLog";


export default function Auditor() {
  return (
    <Routes>
      <Route element={<ComplianceLayout readOnly />}>
        {/* Executive landing page */}
        <Route index element={<ComplianceDashboard />} />

        {/* Read-only audit / reporting */}
        <Route path="audit-log" element={<ExecutiveCompliancePanel />} />
      </Route>
    </Routes>
  );
}
