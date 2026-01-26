import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material"

import { getFrameworks, getDepartments, type Framework, type Department } from "@/api/client"

import {
  getControlsOverview,
  getAllControls,
  createControl,
  Control,
  ControlFrequency,
  ControlOverviewItem,
} from "@/api/client"

type RiskLevel = "HIGH" | "MEDIUM" | "LOW"

const riskColor = (risk: RiskLevel) => {
  switch (risk) {
    case "HIGH":
      return "error"
    case "MEDIUM":
      return "warning"
    case "LOW":
      return "success"
    default:
      return "default"
  }
}

export default function Controls() {
  const [tab, setTab] = useState(0)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [departments, setDepartments] = useState<Department[]>([]) // ✅ ADD
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [overview, setOverview] = useState<ControlOverviewItem[]>([])
  const [controls, setControls] = useState<Control[]>([])

  const [openCreate, setOpenCreate] = useState(false)

  const [form, setForm] = useState<{
  name: string
  framework_id: string
  department_id: string
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUAL" | "AD_HOC"
  severity: "LOW" | "MEDIUM" | "HIGH"
  }>({
  name: "",
  framework_id: "",
  department_id: "",
  frequency: "MONTHLY",
  severity: "MEDIUM",
  })
const loadData = () => {
setLoading(true)
Promise.all([
getControlsOverview(),
getAllControls(),
getFrameworks(),
getDepartments(), // ✅ ADD
])
.then(([overviewRes, controlsRes, frameworksRes, departmentsRes]) => {
setOverview(overviewRes.controls)
setControls(controlsRes)
setFrameworks(frameworksRes)
setDepartments(departmentsRes) // ✅ ADD
setLoading(false)
})
.catch(() => {
setError("Failed to load controls")
setLoading(false)
})
}

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Controls
      </Typography>

      {/* Create Control Button */}
      <Box mb={2}>
        <Button
          variant="contained"
          onClick={() => setOpenCreate(true)}
        >
          Create Control
        </Button>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab label="Overview" />
        <Tab label="Definitions" />
      </Tabs>

      {/* =======================
          TAB 1: OVERVIEW
         ======================= */}
      {tab === 0 && (
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Control</strong></TableCell>
                <TableCell align="center">Runs</TableCell>
                <TableCell align="center">Completed</TableCell>
                <TableCell align="center">In Progress</TableCell>
                <TableCell align="center">Overdue</TableCell>
                <TableCell align="center">Exceptions</TableCell>
                <TableCell align="center">Next Due</TableCell>
                <TableCell align="center">Risk</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {overview.map((c) => (
                <TableRow key={c.controlId} hover>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {c.controlId.slice(0, 8)}…
                  </TableCell>
                  <TableCell align="center">{c.runs}</TableCell>
                  <TableCell align="center">{c.completed}</TableCell>
                  <TableCell align="center">{c.inProgress}</TableCell>
                  <TableCell align="center">
                    <Typography color={c.overdue > 0 ? "error" : "inherit"}>
                      {c.overdue}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{c.exceptions}</TableCell>
                  <TableCell align="center">
                    {c.nextDueAt
                      ? new Date(c.nextDueAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={c.riskLevel}
                      color={riskColor(c.riskLevel)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* =======================
          TAB 2: DEFINITIONS
         ======================= */}
      {tab === 1 && (
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell>Framework</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="center">Frequency</TableCell>
                <TableCell align="center">Severity</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {controls.map((c) => (
                <TableRow key={c.controlId} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.framework.name}</TableCell>
                  <TableCell>{c.department.name}</TableCell>
                  <TableCell align="center">{c.frequency}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={c.severity}
                      color={
                        c.severity === "HIGH"
                          ? "error"
                          : c.severity === "MEDIUM"
                          ? "warning"
                          : "success"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={c.isActive ? "Active" : "Inactive"}
                      color={c.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* =======================
          CREATE CONTROL DIALOG
         ======================= */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Control</DialogTitle>

        <DialogContent>
          <TextField
            label="Control Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <TextField
            select
            label="Framework"
            fullWidth
            margin="dense"
            value={form.framework_id}
            onChange={(e) =>
            setForm({ ...form, framework_id: e.target.value })
            }
            >
            {frameworks.map(f => (
            <MenuItem key={f.id} value={f.id}>
            {f.name}
            </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Department"
            fullWidth
            margin="dense"
            value={form.department_id}
            onChange={(e) =>
            setForm({ ...form, department_id: e.target.value })
            }
            >
            {departments.map(d => (
            <MenuItem key={d.id} value={d.id}>
            {d.name}
            </MenuItem>
            ))}
            </TextField>

          <TextField
            select
            label="Frequency"
            fullWidth
            margin="dense"
            value={form.frequency}
            onChange={(e) =>
              setForm({ ...form, frequency: e.target.value as ControlFrequency })
            }
          >
            {["MONTHLY", "QUARTERLY", "ANNUAL", "AD_HOC"].map(f => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Severity"
            fullWidth
            margin="dense"
            value={form.severity}
            onChange={(e) =>
              setForm({ ...form, severity: e.target.value as "LOW" | "MEDIUM" | "HIGH",})
            }
          >
            {["LOW", "MEDIUM", "HIGH"].map(s => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              await createControl(form)
              setOpenCreate(false)
              setForm({
                name: "",
                framework_id: "",
                department_id: "",
                frequency: "MONTHLY",
                severity: "MEDIUM",
              })
              loadData()
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}