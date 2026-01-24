// src/features/compliance/Users/UsersList.tsx

import { useEffect, useState } from "react";
import {
  getTenantUsers,
  assignUserRole,
  removeUserRole,
  type TenantUser,
} from "@/api/client";

const ALL_ROLES = [
  "COMPLIANCE_OWNER",
  "DEPARTMENT_OWNER",
  "CONTROL_OWNER",
  "EXECUTIVE_VIEWER",
  "AUDITOR",
];

export const UsersList = () => {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

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

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAssignRole = async (userId: number, role: string) => {
    try {
      setActionUserId(userId);
      await assignUserRole(userId, role);
      await loadUsers(); // refresh state
    } catch (err) {
      console.error("Failed to assign role:", err);
      alert("Failed to assign role");
    } finally {
      setActionUserId(null);
    }
  };

  const handleRemoveRole = async (userId: number, role: string) => {
    try {
      setActionUserId(userId);
      await removeUserRole(userId, role);
      await loadUsers(); // refresh state
    } catch (err) {
      console.error("Failed to remove role:", err);
      alert("Failed to remove role");
    } finally {
      setActionUserId(null);
    }
  };

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

      {users.map((u) => (
        <div
          key={u.id}
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
            marginBottom: 8,
          }}
        >
          <div>
            <strong>{u.email}</strong>
          </div>

          <div>Full name: {u.full_name || "—"}</div>
          <div>Active: {u.is_active ? "Yes" : "No"}</div>

          <div>
            Roles:{" "}
            {u.roles.length > 0 ? u.roles.join(", ") : "None"}
          </div>

          {/* Role controls */}
          <div style={{ marginTop: 8 }}>
            {ALL_ROLES.map((role) => {
              const hasRole = u.roles.includes(role);

              return hasRole ? (
                <button
                  key={role}
                  onClick={() => handleRemoveRole(u.id, role)}
                  disabled={actionUserId === u.id}
                  style={{
                    marginRight: 6,
                    background: "#ffe5e5",
                    border: "1px solid #ff9999",
                  }}
                >
                  Remove {role}
                </button>
              ) : (
                <button
                  key={role}
                  onClick={() => handleAssignRole(u.id, role)}
                  disabled={actionUserId === u.id}
                  style={{
                    marginRight: 6,
                    background: "#e6f2ff",
                    border: "1px solid #99c2ff",
                  }}
                >
                  Assign {role}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
