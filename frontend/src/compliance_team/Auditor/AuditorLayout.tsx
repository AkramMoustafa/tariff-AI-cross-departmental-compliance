import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

export default function AuditorLayout() {
  const { session, loading, logout } = useSession();

  if (loading) return <div>Loading…</div>;
  if (!session) return <Navigate to="/signin" replace />;

  if (session.active_role !== "AUDITOR") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <nav style={{ width: 220, padding: 16 }}>
        <NavLink to="/auditor" end>Dashboard</NavLink><br />
        <NavLink to="/auditor/evidence">Evidence Requests</NavLink>
      </nav>

      <main style={{ flex: 1, padding: 24 }}>
        <header>
          <strong>Auditor</strong>
          <button onClick={logout} style={{ float: "right" }}>
            Logout
          </button>
        </header>

        <Outlet />
      </main>
    </div>
  );
}