// src/control_owner/ControlOwnerLayout.tsx

import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

export default function ControlOwnerLayout() {
  const { session, loading, logout } = useSession();

  if (loading) return <div>Loading…</div>;
  if (!session) return <Navigate to="/signin" replace />;

  if (session.active_role !== "CONTROL_OWNER") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <nav style={{ width: 220, padding: 16 }}>
        <NavLink to="/control_owner" end>Dashboard</NavLink><br />
        <NavLink to="/control_owner/evidence">Evidence Tasks</NavLink><br />
        <NavLink to="/control_owner/executions">Control Executions</NavLink>
      </nav>

      <main style={{ flex: 1, padding: 24 }}>
        <header>
          <strong>Control Owner</strong>
          <button onClick={logout} style={{ float: "right" }}>
            Logout
          </button>
        </header>

        <Outlet />
      </main>
    </div>
  );
}