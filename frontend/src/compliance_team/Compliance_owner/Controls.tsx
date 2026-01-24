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
} from "@mui/material"
import { getControlsOverview } from "@/api/client"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [controls, setControls] = useState<any[]>([])

  useEffect(() => {
    getControlsOverview()
      .then((res) => {
        setControls(res.controls)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load controls overview")
        setLoading(false)
      })
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
        Controls Overview
      </Typography>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Control ID</strong></TableCell>
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
            {controls.map((c) => (
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
    </Box>
  )
}
