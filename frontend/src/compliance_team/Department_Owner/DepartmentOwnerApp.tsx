import { Routes, Route } from "react-router-dom";
import { ComplianceLayout } from "../Compliance_owner/ComplianceLayout";
import { ComplianceDashboard } from "../Compliance_owner/ComplianceDashboard";
import { ExecutiveCompliancePanel } from "../Compliance_owner/AuditLog";


export default function DepartmentOwnerApp() {
  return (
    <Routes>
      <Route element={<ComplianceLayout readOnly />}>
        <Route index element={<ComplianceDashboard />} />
        <Route path="audit-log" element={<ExecutiveCompliancePanel />} />
      </Route>
    </Routes>
  );
}
