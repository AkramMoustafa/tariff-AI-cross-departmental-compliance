import { useEffect, useState } from "react";
import {
  getEvidenceTasks,
  submitEvidence,
  EvidenceTask,
} from "@/api/controlOwner.api";

export default function EvidenceTasksPage() {
  const [tasks, setTasks] = useState<EvidenceTask[]>([]);

  useEffect(() => {
    getEvidenceTasks().then(setTasks);
  }, []);

  return (
    <>
      <h2>Evidence Tasks</h2>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Status</th>
            <th>Due</th>
            <th>Evidence</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td>{t.description}</td>
              <td>{t.status}</td>
              <td>{new Date(t.due_at).toLocaleDateString()}</td>
              <td>{t.evidence_count}</td>
              <td>
                {t.status !== "SUBMITTED" && (
                  <button
                    onClick={() =>
                      submitEvidence(t.id, "Evidence uploaded")
                    }
                  >
                    Submit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}