import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material"

import {
  getComplianceOwnerInbox,
  InboxItem,
} from "@/api/client"

const priorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "error"
    case "MEDIUM":
      return "warning"
    default:
      return "default"
  }
}

export default function Inbox() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getComplianceOwnerInbox()
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    )
  }

  if (items.length === 0) {
    return (
      <Box p={4}>
        <Typography variant="h6">Inbox</Typography>
        <Typography color="text.secondary" mt={2}>
          🎉 You’re all caught up. No pending actions.
        </Typography>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <Typography variant="h5" mb={3}>
        Inbox
      </Typography>

      <Stack spacing={2}>
        {items.map((item, index) => (
          <Paper key={index} sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack spacing={0.5}>
                <Typography fontWeight={600}>
                  {renderTitle(item)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {renderSubtitle(item)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {new Date(item.createdAt).toLocaleString()}
                </Typography>
              </Stack>

              <Stack spacing={1} alignItems="flex-end">
                <Chip
                  size="small"
                  label={item.priority}
                  color={priorityColor(item.priority)}
                />

                {item.requiresAction && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleAction(item)}
                  >
                    Review
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function renderTitle(item: InboxItem): string {
  switch (item.type) {
    case "AUDITOR_EVIDENCE_REQUEST":
      return "Auditor requested evidence access"

    case "CONTROL_OWNER_NOMINATION":
      return "Control Owner nomination pending"

    case "EVIDENCE_REVIEW":
      return "Evidence submitted for review"

    case "OVERDUE_EVIDENCE":
      return "Overdue evidence request"

    default:
      return "Inbox item"
  }
}

function renderSubtitle(item: InboxItem): string {
  const d = item.data as any

  switch (item.type) {
    case "AUDITOR_EVIDENCE_REQUEST":
      return `Auditor: ${d.auditorEmail}`

    case "CONTROL_OWNER_NOMINATION":
      return `Nominee: ${d.nomineeEmail}`

    case "EVIDENCE_REVIEW":
      return `Submitted by: ${d.submittedBy}`

    case "OVERDUE_EVIDENCE":
      return d.description || "Evidence overdue"

    default:
      return ""
  }
}

function handleAction(item: InboxItem) {
  // 🔌 Wire this to routing later
  // Example:
  // navigate(`/compliance/evidence/${item.data.requestId}`)
  console.log("Action clicked for:", item)
}
