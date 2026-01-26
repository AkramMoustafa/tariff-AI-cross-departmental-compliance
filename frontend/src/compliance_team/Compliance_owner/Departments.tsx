import React, { useEffect, useState } from "react"
import {
  getDepartments,
  createDepartment,
  assignUserToDepartment,
  getTenantUsers,
  type Department,
  type TenantUser,
} from "@/api/client"

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<TenantUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // create department
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [creating, setCreating] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [deptData, userData] = await Promise.all([
        getDepartments(),
        getTenantUsers(),
      ])
      setDepartments(deptData)
      setUsers(userData)
    } catch (err) {
      console.error(err)
      setError("Failed to load departments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) return

    try {
      setCreating(true)
      await createDepartment(newDepartmentName)
      setNewDepartmentName("")
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Failed to create department")
    } finally {
      setCreating(false)
    }
  }

  const handleAssignUser = async (
    departmentId: number,
    userId: number
  ) => {
    try {
      await assignUserToDepartment(departmentId, userId)
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Failed to assign user to department")
    }
  }

  if (loading) return <div>Loading departments…</div>
  if (error) return <div style={{ color: "red" }}>{error}</div>

  return (
    <div style={styles.root}>
      <h1>Departments</h1>

      {/* ---------- Create Department ---------- */}
      <section style={styles.section}>
        <h2>Create Department</h2>

        <input
          type="text"
          placeholder="Department name"
          value={newDepartmentName}
          onChange={(e) => setNewDepartmentName(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handleCreateDepartment}
          disabled={creating}
          style={styles.button}
        >
          {creating ? "Creating…" : "Create Department"}
        </button>
      </section>

      {/* ---------- Departments Table ---------- */}
      <section>
        <h2>Existing Departments</h2>

        {departments.length === 0 ? (
          <div>No departments found.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>User Count</th>
                <th>Assign User</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.name}</td>
                  <td>{dept.userCount}</td>
                  <td>
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        handleAssignUser(
                          dept.id,
                          Number(e.target.value)
                        )
                      }
                    >
                      <option value="" disabled>
                        Select user
                      </option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: "1000px",
  },
  section: {
    marginBottom: "28px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "8px",
  },
  button: {
    padding: "8px 14px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
}
