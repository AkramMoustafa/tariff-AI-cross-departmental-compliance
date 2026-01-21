import React from "react";
import { useNavigate } from "react-router-dom";
import { useComplianceDashboard } from "../Dashboard/useComplianceDashboard";

export const ComplianceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useComplianceDashboard();

  if (isLoading) {
    return <div>Loading dashboard…</div>;
  }

  if (error || !data) {
    return <div>Unable to load compliance dashboard.</div>;
  }

  const {
    pendingEvidenceAccess,
    pendingNominations,
    executiveRequests,
    overdueEvidence,
    overdueControls,
    recentActivity = [],
  } = data;

  return (
    <div style={styles.root}>
      <h1 style={styles.title}>Compliance Dashboard</h1>

      {/* Pending Reviews */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pending Reviews</h2>
        <div style={styles.cardGrid}>
          <DashboardCard
            label="Evidence Access Requests"
            count={pendingEvidenceAccess}
            onClick={() => navigate("/compliance/evidence")}
          />
          <DashboardCard
            label="Control Owner Nominations"
            count={pendingNominations}
            onClick={() => navigate("/compliance/inbox?tab=nominations")}
          />
          <DashboardCard
            label="Executive Requests"
            count={executiveRequests}
            onClick={() => navigate("/compliance/inbox?tab=executive")}
          />
        </div>
      </section>

      {/* Risk Indicators */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Risk Indicators</h2>
        <div style={styles.cardGrid}>
          <DashboardCard
            label="Overdue Evidence Requests"
            count={overdueEvidence}
            highlight={overdueEvidence > 0}
            onClick={() =>
              navigate("/compliance/evidence?filter=overdue")
            }
          />
          <DashboardCard
            label="Overdue Control Executions"
            count={overdueControls}
            highlight={overdueControls > 0}
            onClick={() =>
              navigate("/compliance/controls?filter=overdue")
            }
          />
        </div>
      </section>

      {/* Administration */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Administration</h2>
        <div style={styles.cardGrid}>
          <DashboardCard
            label="User Management"
            count={0}
            onClick={() => navigate("/compliance/users")}
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Activity</h2>

        {recentActivity.length === 0 ? (
          <div style={styles.empty}>No recent activity.</div>
        ) : (
          <ul style={styles.activityList}>
            {recentActivity.map((item) => (
              <li key={item.id} style={styles.activityItem}>
                <div style={styles.activityAction}>{item.action}</div>
                <div style={styles.activityMeta}>
                  {item.actorEmail} ·{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

interface DashboardCardProps {
  label: string;
  count: number;
  onClick: () => void;
  highlight?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  label,
  count,
  onClick,
  highlight = false,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.card,
        cursor: "pointer",
        borderColor: highlight ? "#d32f2f" : "#e0e0e0",
      }}
    >
      <div style={styles.cardLabel}>{label}</div>
      <div
        style={{
          ...styles.cardCount,
          color: highlight ? "#d32f2f" : "#1976d2",
        }}
      >
        {count}
      </div>
    </div>
  );
};

/* ---------- styles ---------- */

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: "1200px",
  },
  title: {
    marginBottom: "24px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    marginBottom: "12px",
    fontSize: "1.1rem",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "16px",
    backgroundColor: "#ffffff",
  },
  cardLabel: {
    color: "#555",
    marginBottom: "8px",
  },
  cardCount: {
    fontSize: "1.8rem",
    fontWeight: 600,
  },
  empty: {
    color: "#777",
    fontStyle: "italic",
  },
  activityList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  activityItem: {
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  activityAction: {
    fontWeight: 500,
  },
  activityMeta: {
    fontSize: "0.85rem",
    color: "#666",
  },
};
