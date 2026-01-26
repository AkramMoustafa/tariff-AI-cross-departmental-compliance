// src/department_owner/DepartmentOwnerLayout.tsx
import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

export default function DepartmentOwnerLayout() {
  const { session, loading, logout } = useSession();

  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/signin" replace />;

  if (session.active_role !== "DEPARTMENT_OWNER") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div style={styles.root}>
      <header style={styles.topBar}>
        <strong>{session.tenant_name} — Department</strong>

        <div style={styles.topBarRight}>
          <span>{session.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div style={styles.body}>
        <nav style={styles.nav}>
          <NavLink to="/department_owner" end style={navLinkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/department_owner/users" style={navLinkStyle}>
            Team Members
          </NavLink>
          <NavLink to="/department_owner/evidence" style={navLinkStyle}>
            Evidence Requests
          </NavLink>
        </nav>

        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { height: "100vh", display: "flex", flexDirection: "column" },
  topBar: {
    height: 56,
    padding: "0 16px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #ddd",
  },
  topBarRight: { display: "flex", gap: 12 },
  body: { flex: 1, display: "flex" },
  nav: {
    width: 220,
    padding: 16,
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  content: { flex: 1, padding: 24 },
};

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: "8px 12px",
  borderRadius: 4,
  textDecoration: "none",
  background: isActive ? "#1976d2" : "transparent",
  color: isActive ? "#fff" : "#333",
});