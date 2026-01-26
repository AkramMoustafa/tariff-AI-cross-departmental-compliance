// src/control_owner/ControlOwnerDashboard.tsx

import { useEffect, useState } from "react";
import {
  getEvidenceTasks,
  getControlExecutions,
  EvidenceTask,
  ControlExecution,
} from "@/api/controlOwner.api";

export default function ControlOwnerDashboard() {
  const [evidence, setEvidence] = useState<EvidenceTask[]>([]);
  const [executions, setExecutions] = useState<ControlExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEvidenceTasks(), getControlExecutions()])
      .then(([evidenceRes, executionRes]) => {
        setEvidence(evidenceRes);
        setExecutions(executionRes);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard…</div>;

  const now = new Date();

  const overdueEvidence = evidence.filter(
    (e) => new Date(e.due_at) < now && e.status !== "SUBMITTED"
  );

  const dueSoonEvidence = evidence.filter((e) => {
    const due = new Date(e.due_at);
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7 && e.status !== "SUBMITTED";
  });

  const pendingExecutions = executions.filter(
    (e) => e.status !== "COMPLETED"
  );

  return (
    <>
      <h2>Control Owner Dashboard</h2>

      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <SummaryCard label="Overdue Evidence" value={overdueEvidence.length} color="red" />
        <SummaryCard label="Due This Week" value={dueSoonEvidence.length} color="orange" />
        <SummaryCard label="Pending Executions" value={pendingExecutions.length} color="blue" />
        <SummaryCard label="Completed Executions" value={
          executions.filter(e => e.status === "COMPLETED").length
        } color="green" />
      </div>

      <h3>Next Actions</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {evidence
            .filter(e => e.status !== "SUBMITTED")
            .slice(0, 5)
            .map(e => (
              <tr key={`evidence-${e.id}`}>
                <td>Evidence</td>
                <td>{e.description}</td>
                <td>{e.status}</td>
                <td>{new Date(e.due_at).toLocaleDateString()}</td>
              </tr>
            ))}

          {executions
            .filter(e => e.status !== "COMPLETED")
            .slice(0, 5)
            .map(e => (
              <tr key={`execution-${e.id}`}>
                <td>Execution</td>
                <td>{e.control_id}</td>
                <td>{e.status}</td>
                <td>{new Date(e.due_at).toLocaleDateString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}



function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        border: `2px solid ${color}`,
        minWidth: 160,
      }}
    >
      <strong>{label}</strong>
      <div style={{ fontSize: 24 }}>{value}</div>
    </div>
  );
}