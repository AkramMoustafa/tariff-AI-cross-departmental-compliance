import React from "react";
import { Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

type ComplianceLayoutProps = {
  readOnly?: boolean;
};

export const ComplianceLayout: React.FC<ComplianceLayoutProps> = ({
  readOnly = false,
}) => {
  const {
    session,
    loading,
    logout,
    setActiveRole,
  } = useSession();

  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div style={styles.root}>
      {/* Top Bar */}
      <header style={styles.topBar}>
        <div>
          <strong>{session.tenant_name}</strong>
        </div>

        <div style={styles.topBarRight}>
          {/* 🔁 ROLE TOGGLE */}
          {session.roles.length > 1 ? (
            <select
              value={session.active_role ?? ""}
              onChange={async (e) => {
                const role = e.target.value;
                if (!role) return;

                await setActiveRole(role);
                navigate("/redirect", { replace: true });
              }}
              style={styles.roleSelect}
            >
              {session.roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </select>
          ) : (
            <span>
              Role: {session.active_role?.replace("_", " ")}
            </span>
          )}

          <span>{session.email}</span>

          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={styles.body}>
        <nav style={styles.nav}>
          <NavLink to="/compliance" end style={navLinkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/compliance/inbox" style={navLinkStyle}>
            Inbox
          </NavLink>
          <NavLink to="/compliance/framework" style={navLinkStyle}>
            Frameworks
          </NavLink>
          <NavLink to="/compliance/controls" style={navLinkStyle}>
            Controls
          </NavLink>
          <NavLink to="/compliance/audit-log" style={navLinkStyle}>
            Audit Log
          </NavLink>
        </nav>

        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

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
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoutButton: {
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontWeight: 500,
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

const navLinkStyle = ({
  isActive,
}: {
  isActive: boolean;
}): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: "4px",
  textDecoration: "none",
  color: isActive ? "#ffffff" : "#333333",
  backgroundColor: isActive ? "#1976d2" : "transparent",
});
