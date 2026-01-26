import { useEffect, useState } from "react";
import {
  getDepartmentOverview,
  DepartmentUser,
} from "@/api/departmentOwner.api";

export default function DepartmentUsersPage() {
  const [users, setUsers] = useState<DepartmentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartmentOverview()
      .then((data) => {
        setUsers(data.users);
      })
      .catch(() => {
        setError("Failed to load department users");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading department members…</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <h2>Department Members</h2>

      {users.length === 0 ? (
        <p>No users found in this department.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email}>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}