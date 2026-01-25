import { useEffect, useState } from "react";
import {
  getDepartmentOverview,
  EvidenceRequest,
} from "@/api/departmentOwner.api";

export default function DepartmentEvidencePage() {
  const [evidence, setEvidence] = useState<EvidenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartmentOverview()
      .then((data) => {
        setEvidence(data.evidence_requests);
      })
      .catch(() => {
        setError("Failed to load evidence requests");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading evidence requests…</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <h2>Evidence Requests</h2>

      {evidence.length === 0 ? (
        <p>No evidence requests for your department.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((e) => (
              <tr key={e.id}>
                <td>{e.description}</td>
                <td>{e.status}</td>
                <td>{e.assigned_to}</td>
                <td>
                  {e.due_at
                    ? new Date(e.due_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}