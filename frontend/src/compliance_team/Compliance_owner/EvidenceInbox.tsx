// src/features/compliance/Evidence/EvidenceInbox.tsx
import { useEffect, useState } from "react";
import {
  getPendingAuditorAccess,
  reviewAuditorAccess,
} from "@/api/client";

export const EvidenceInbox = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingAuditorAccess()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading evidence requests…</div>;
  if (!requests.length) return <div>No pending evidence requests.</div>;

  return (
    <div>
      <h2>Pending Evidence Access</h2>

      {requests.map((r) => (
        <div key={r.id} style={{ borderBottom: "1px solid #eee", padding: 12 }}>
          <div><strong>Auditor:</strong> {r.email}</div>
          <div><strong>Requested:</strong> {new Date(r.requested_at).toLocaleString()}</div>

          <button
            onClick={() =>
              reviewAuditorAccess(r.id, {
                evidence_request_id: r.evidence_request_id,
                auditor_email: r.email,
                approve: true,
              })
            }
          >
            Approve
          </button>

          <button
            onClick={() =>
              reviewAuditorAccess(r.id, {
                evidence_request_id: r.evidence_request_id,
                auditor_email: r.email,
                approve: false,
              })
            }
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};
