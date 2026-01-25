import { useEffect, useState } from "react";
import {
  getControlExecutions,
  completeControlExecution,
  ControlExecution,
} from "@/api/controlOwner.api";

export default function ControlExecutionsPage() {
  const [executions, setExecutions] = useState<ControlExecution[]>([]);

  useEffect(() => {
    getControlExecutions().then(setExecutions);
  }, []);

  return (
    <>
      <h2>Control Executions</h2>

      <table>
        <thead>
          <tr>
            <th>Control</th>
            <th>Status</th>
            <th>Due</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {executions.map(e => (
            <tr key={e.id}>
              <td>{e.control_id}</td>
              <td>{e.status}</td>
              <td>{new Date(e.due_at).toLocaleDateString()}</td>
              <td>
                {e.status !== "COMPLETED" && (
                  <button
                    onClick={() =>
                      completeControlExecution(e.id)
                    }
                  >
                    Complete
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