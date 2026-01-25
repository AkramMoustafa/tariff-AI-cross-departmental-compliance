import { useEffect, useState } from "react";
import {
  getEvidenceRequests,
  requestEvidenceAccess,
  EvidenceRequest,
} from "@/api/auditor.api";

export default function EvidenceRequestsPage() {
  const [requests, setRequests] = useState<EvidenceRequest[]>([]);

  useEffect(() => {
    getEvidenceRequests().then(setRequests);
  }, []);

  return (
    <>
      <h2>Evidence Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Status</th>
            <th>Files</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>{r.description}</td>
              <td>{r.status}</td>
              <td>{r.file_count}</td>
              <td>
                <button
                  onClick={() => requestEvidenceAccess(r.id)}
                >
                  Request Access
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}