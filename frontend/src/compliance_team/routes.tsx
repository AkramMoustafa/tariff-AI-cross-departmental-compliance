import { Navigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

export function RootRedirect() {
  const { session, loading } = useSession();

  if (loading) return <div>Loading session…</div>;

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  // Role not selected yet
  if (!session.active_role) {
    if (session.roles.length === 1) {
      return <Navigate to="/compliance/auto-role" replace />;
    }
    return <Navigate to="/select-role" replace />;
  }

  // ✅ ROLE-BASED LANDING
  switch (session.active_role) {
    
    case "COMPLIANCE_OWNER":
      return <Navigate to="/compliance" replace />;

    case "EXECUTIVE_VIEWER":
      return <Navigate to="/executive" replace />;

    case "DEPARTMENT_OWNER":
      return <Navigate to="/department_owner" replace />;
    
      case "CONTROL_OWNER":
      return <Navigate to="/control_owner" replace />;

    case "AUDITOR":
      return <Navigate to="/auditor" replace />;

    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
