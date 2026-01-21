import { Routes, Route } from "react-router-dom";
import { ComplianceLayout } from "./Compliance_owner/ComplianceLayout";
import { ComplianceDashboard } from "./Compliance_owner/ComplianceDashboard";
import { EvidenceInbox } from "./Compliance_owner/EvidenceInbox";
import { UsersList } from "./Compliance_owner/UsersList";
import { AuditLog } from "./Compliance_owner/AuditLog";

export default function ComplianceApp() {
  return (
    <Routes>
      <Route element={<ComplianceLayout />}>
        <Route index element={<ComplianceDashboard />} />
        <Route path="evidence" element={<EvidenceInbox />} />
        <Route path="users" element={<UsersList />} />
        <Route path="log" element={<AuditLog />} />
      </Route>
    </Routes>
  );
}
