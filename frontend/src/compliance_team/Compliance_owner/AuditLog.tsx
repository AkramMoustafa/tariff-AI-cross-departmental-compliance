import React, { useState } from "react"
import {
  sendExecutiveComplianceReport,
  getExecutiveComplianceSnapshot,
  type ExecutiveComplianceSendResponse,
  type ExecutiveComplianceSnapshot,
} from "@/api/client"

export const ExecutiveCompliancePanel: React.FC = () => {
  const [loadingSnapshot, setLoadingSnapshot] = useState(false)
  const [snapshot, setSnapshot] =
    useState<ExecutiveComplianceSnapshot | null>(null)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)

  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] =
    useState<ExecutiveComplianceSendResponse | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const loadSnapshot = async () => {
    setLoadingSnapshot(true)
    setSnapshotError(null)

    try {
      const data = await getExecutiveComplianceSnapshot()
      setSnapshot(data)
    } catch (err) {
      console.error("Failed to load executive snapshot", err)
      setSnapshotError("Failed to load executive compliance snapshot")
    } finally {
      setLoadingSnapshot(false)
    }
  }

  const handleSendReport = async () => {
    setSending(true)
    setSendResult(null)
    setSendError(null)

    try {
      const result = await sendExecutiveComplianceReport()
      setSendResult(result)

      // Optional: refresh snapshot after sending
      await loadSnapshot()
    } catch (err) {
      console.error("Failed to send executive report", err)
      setSendError("Failed to send executive compliance report")
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={styles.root}>
      <h1 style={styles.title}>Executive Compliance</h1>

      {/* ---------- Snapshot ---------- */}
      <section style={styles.section}>
        <button
          onClick={loadSnapshot}
          disabled={loadingSnapshot}
          style={styles.button}
        >
          {loadingSnapshot ? "Loading Snapshot…" : "Load Compliance Snapshot"}
        </button>

        {snapshotError && (
          <div style={styles.error}>{snapshotError}</div>
        )}

        {snapshot && (
          <div style={styles.snapshot}>
            <h3>
              Overall Posture:{" "}
              <strong>{snapshot.posture}</strong>
            </h3>

            <ul>
              <li>
                Frameworks — Active: {snapshot.frameworks.active}, Out of
                Scope: {snapshot.frameworks.out_of_scope}, Inactive:{" "}
                {snapshot.frameworks.inactive}
              </li>
              <li>
                Evidence — Open: {snapshot.evidence.open}, Submitted:{" "}
                {snapshot.evidence.submitted}, Completed:{" "}
                {snapshot.evidence.completed}, Overdue:{" "}
                {snapshot.evidence.overdue}
              </li>
              <li>
                Controls — Exceptions: {snapshot.controls.exceptions},
                Overdue: {snapshot.controls.overdue}
              </li>
              <li>
                Governance — Pending Nominations:{" "}
                {snapshot.governance.pending_control_owner_nominations}
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* ---------- Send Executive Report ---------- */}
      <section style={styles.section}>
        <button
          onClick={handleSendReport}
          disabled={sending}
          style={styles.button}
        >
          {sending
            ? "Sending Executive Report…"
            : "Send Executive Compliance Report"}
        </button>

        {sendError && (
          <div style={styles.error}>{sendError}</div>
        )}

        {sendResult && (
          <div style={styles.result}>
            {sendResult.status === "sent" ? (
              <>
                Report sent to {sendResult.recipients} executive(s). <br />
                Posture at send time:{" "}
                <strong>{sendResult.posture}</strong>
              </>
            ) : (
              "No executive recipients found."
            )}
          </div>
        )}
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: "1000px",
  },
  title: {
    marginBottom: "16px",
  },
  section: {
    marginBottom: "32px",
  },
  button: {
    padding: "10px 16px",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  snapshot: {
    marginTop: "16px",
    backgroundColor: "#f9f9f9",
    padding: "16px",
    borderRadius: "4px",
  },
  result: {
    marginTop: "12px",
    color: "#2e7d32",
    fontSize: "0.9rem",
  },
  error: {
    marginTop: "12px",
    color: "#d32f2f",
    fontSize: "0.9rem",
  },
}
