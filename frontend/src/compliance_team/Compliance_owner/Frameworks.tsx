import React, { useEffect, useState } from "react"
import {
  getFrameworks,
  setFrameworkStatus,
  createCustomFramework,
  type Framework,
} from "@/api/client"

export const Frameworks: React.FC = () => {
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create framework state
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [creating, setCreating] = useState(false)

  const loadFrameworks = async () => {
    try {
      setLoading(true)
      const data = await getFrameworks()
      setFrameworks(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load frameworks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFrameworks()
  }, [])

  const handleStatusChange = async (
    frameworkId: number,
    status: Framework["status"]
  ) => {
    try {
      await setFrameworkStatus(frameworkId, status)
      await loadFrameworks()
    } catch (err) {
      console.error(err)
      alert("Failed to update framework status")
    }
  }

  const handleCreateFramework = async () => {
    if (!newName.trim()) return

    try {
      setCreating(true)
      await createCustomFramework({
        name: newName,
        description: newDescription || undefined,
      })

      setNewName("")
      setNewDescription("")
      await loadFrameworks()
    } catch (err) {
      console.error(err)
      alert("Failed to create framework")
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div>Loading frameworks…</div>
  if (error) return <div style={{ color: "red" }}>{error}</div>

  return (
    <div style={styles.root}>
      <h1>Frameworks</h1>

      {/* ---------- Create Custom Framework ---------- */}
      <section style={styles.section}>
        <h2>Create Custom Framework</h2>

        <input
          type="text"
          placeholder="Framework name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          style={styles.textarea}
        />

        <button
          onClick={handleCreateFramework}
          disabled={creating}
          style={styles.button}
        >
          {creating ? "Creating…" : "Create Framework"}
        </button>
      </section>

      <section>
        <h2>Available Frameworks</h2>

        {frameworks.length === 0 ? (
          <div>No frameworks found.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Authority</th>
                <th>Type</th>
                <th>Jurisdiction</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {frameworks.map((fw) => (
                <tr key={fw.id}>
                  <td>{fw.name}</td>
                  <td>{fw.authority}</td>
                  <td>{fw.framework_type}</td>
                  <td>{fw.jurisdiction}</td>
                  <td>{fw.status}</td>
                  <td>
                    <select
                      value={fw.status}
                      onChange={(e) =>
                        handleStatusChange(
                          fw.id,
                          e.target.value as Framework["status"]
                        )
                      }
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="OUT_OF_SCOPE">OUT OF SCOPE</option>
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
    maxWidth: "1100px",
  },
  section: {
    marginBottom: "32px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    minHeight: "80px",
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
