import React, { useEffect, useState } from "react"
import {
  getAuditLog,
  sendExecutiveComplianceReport,
  type AuditLogEntry,
  type ExecutiveComplianceSendResponse,
} from "@/api/client"

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] =
    useState<ExecutiveComplianceSendResponse | null>(null)

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        const data = await getAuditLog(100)
        setLogs(data)
      } catch (err) {
        console.error("Failed to load audit log", err)
        setError("Failed to load audit log")
      } finally {
        setLoading(false)
      }
    }

    loadAuditLog()
  }, [])

  const handleSendReport = async () => {
    setSending(true)
    setSendResult(null)

    try {
      const result = await sendExecutiveComplianceReport()
      setSendResult(result)

      // refresh audit log after sending
      const updatedLogs = await getAuditLog(100)
      setLogs(updatedLogs)
    } catch (err) {
      console.error("Failed to send executive report", err)
      setError("Failed to send executive report")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div>Loading audit log…</div>
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>
  }

  return (
    <div style={styles.root}>
      <h1 style={styles.title}>Audit Log</h1>

      {/* ---------- Executive Action ---------- */}
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

        {sendResult && (
          <div style={styles.result}>
            {sendResult.status === "sent" ? (
              <>
                Report sent to {sendResult.recipients} executive(s). <br />
                Posture: <strong>{sendResult.posture}</strong>
              </>
            ) : (
              "No executive recipients found."
            )}
          </div>
        )}
      </section>

      {/* ---------- Audit Log Table ---------- */}
      {logs.length === 0 ? (
        <div>No audit entries found.</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Actor</th>
              <th style={styles.th}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={styles.td}>{log.action}</td>
                <td style={styles.td}>
                  {log.actorEmail ?? "System"}
                </td>
                <td style={styles.td}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ===============================
 * Styles
 * =============================== */

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: "1200px",
  },
  title: {
    marginBottom: "16px",
  },
  section: {
    marginBottom: "24px",
  },
  button: {
    padding: "10px 16px",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  result: {
    marginTop: "12px",
    color: "#2e7d32",
    fontSize: "0.9rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    borderBottom: "2px solid #e0e0e0",
    fontWeight: 600,
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
}
