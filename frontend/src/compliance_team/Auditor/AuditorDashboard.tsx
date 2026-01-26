import { useEffect, useState } from "react";
import { getEvidenceRequests, EvidenceRequest } from "@/api/auditor.api";

export default function AuditorDashboard() {
  const [requests, setRequests] = useState<EvidenceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvidenceRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <h2>Auditor Dashboard</h2>

      <ul>
        <li>Total Evidence Requests: {requests.length}</li>
        <li>
          With Files: {requests.filter(r => r.file_count > 0).length}
        </li>
      </ul>
    </>
  );
}