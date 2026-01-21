import { Navigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";
import { Role } from "@/api/roles";

export function RootRedirect() {
  const { session, loading } = useSession();

  if (loading) return null;

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  switch (session.active_role) {
    case Role.COMPLIANCE_OWNER:
      return <Navigate to="/compliance" replace />;
    case Role.DEPARTMENT_OWNER:
      return <Navigate to="/department" replace />;
    case Role.CONTROL_OWNER:
      return <Navigate to="/control-owner" replace />;
    case Role.EXECUTIVE_VIEWER:
      return <Navigate to="/executive" replace />;
    case Role.AUDITOR:
      return <Navigate to="/auditor" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
