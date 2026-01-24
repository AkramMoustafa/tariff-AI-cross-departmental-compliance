import { Routes, Route } from "react-router-dom";
import { ComplianceLayout } from "./Compliance_owner/ComplianceLayout";
import { ComplianceDashboard } from "./Compliance_owner/ComplianceDashboard";
import { EvidenceInbox } from "./Compliance_owner/EvidenceInbox";
import { UsersList } from "./Compliance_owner/UsersList";
import { ExecutiveCompliancePanel } from "./Compliance_owner/AuditLog";
import { Frameworks } from "./Compliance_owner/Frameworks";
import Inbox from "./Compliance_owner/Inbox";
import Controls from "./Compliance_owner/Controls";
import { Departments } from "./Compliance_owner/Departments";
import SelectRole from "./SelectRole";
import AutoRole from "./AutoRole";
export default function ComplianceApp() {
  
  return (
    <Routes>
      <Route element={<ComplianceLayout />}>
        <Route index element={<ComplianceDashboard />} />
        <Route path="evidence" element={<EvidenceInbox />} />
        <Route path="users" element={<UsersList />} />
        <Route path="framework" element={<Frameworks />} />
        <Route path="inbox" element={<Inbox/>} />
        <Route path="audit-log" element={<ExecutiveCompliancePanel />} />
        <Route path="controls" element={<Controls />} />
        <Route path="departments" element={<Departments />} />
        <Route path="select-role" element={<SelectRole />} />
        <Route path="auto-role" element={<AutoRole />} />
      </Route>
    </Routes>
  );
}
