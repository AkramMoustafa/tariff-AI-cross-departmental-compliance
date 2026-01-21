import React from "react";
import { Navigate, Outlet, NavLink } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";
import { Role } from "@/api/roles";

export const ComplianceLayout: React.FC = () => {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session || session.active_role !== Role.COMPLIANCE_OWNER) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div style={styles.root}>
      {/* Top Bar */}
      <header style={styles.topBar}>
        <div>
          <strong>{session.tenant_name}</strong>
        </div>
        <div>
          Role: Compliance Owner &nbsp;|&nbsp; {session.email}
        </div>
      </header>

      {/* Main Layout */}
      <div style={styles.body}>
        {/* Side Navigation */}
        <nav style={styles.nav}>
          <NavLink to="/compliance" end style={navLinkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/compliance/inbox" style={navLinkStyle}>
            Inbox
          </NavLink>
          <NavLink to="/compliance/evidence" style={navLinkStyle}>
            Evidence
          </NavLink>
          <NavLink to="/compliance/controls" style={navLinkStyle}>
            Controls
          </NavLink>
          <NavLink to="/Compliance_owner/AuditLog" style={navLinkStyle}>
            Audit Log
          </NavLink>
        </nav>

        {/* Page Content */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/* ---------- styles ---------- */

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  topBar: {
    height: "56px",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
  },
  body: {
    display: "flex",
    flex: 1,
  },
  nav: {
    width: "220px",
    borderRight: "1px solid #e0e0e0",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backgroundColor: "#fafafa",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
};

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: "4px",
  textDecoration: "none",
  color: isActive ? "#ffffff" : "#333333",
  backgroundColor: isActive ? "#1976d2" : "transparent",
});
