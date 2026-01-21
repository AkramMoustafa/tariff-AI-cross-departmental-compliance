// src/features/compliance/Users/UsersList.tsx
import { useEffect, useState } from "react";
import { getTenantUsers, type TenantUser } from "@/api/client";

export const UsersList = () => {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getTenantUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) {
    return <div>Loading users…</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!users || users.length === 0) {
    return <div>No users found.</div>;
  }

  return (
    <div>
      <h2>Employees</h2>

      {users.map((u, index) => (
        <div
          key={u.id ?? index}
          style={{ padding: 12, borderBottom: "1px solid #eee" }}
        >
          <div>
            <strong>{u.email || "—"}</strong>
          </div>

          <div>
            Full name: {u.full_name || "—"}
          </div>

          <div>
            Active: {u.is_active ? "Yes" : "No"}
          </div>

          <div>
            Roles: {u.roles.length > 0 ? u.roles.join(", ") : "None"}
          </div>
        </div>
      ))}
    </div>
  );
};
