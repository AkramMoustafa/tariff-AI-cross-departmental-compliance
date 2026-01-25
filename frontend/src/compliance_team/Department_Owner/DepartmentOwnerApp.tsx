// src/department_owner/DepartmentOwnerApp.tsx
import { Routes, Route } from "react-router-dom";
import DepartmentOwnerLayout from "./DepartmentOwnerLayout";
import DepartmentOwnerDashboard from "./DepartmentOwnerDashboard";
import DepartmentUsersPage from "./DepartmentUsersPage";
import DepartmentEvidencePage from "./DepartmentEvidencePage";


export default function DepartmentOwnerApp() {
return (
<Routes>
<Route element={<DepartmentOwnerLayout />}>
<Route index element={<DepartmentOwnerDashboard />} />
<Route path="users" element={<DepartmentUsersPage />} />
<Route path="evidence" element={<DepartmentEvidencePage />} />
</Route>
</Routes>
);
}