// src/SelectRole.tsx
import { useSession } from "@/api/SessionProvider";
import { useNavigate } from "react-router-dom";
import { Button, Stack, Typography, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { Role } from "@/api/roles";

export default function SelectRole() {
  const { session, setActiveRole } = useSession();
  const navigate = useNavigate();

  const [loadingRole, setLoadingRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.active_role) {
      navigate("/redirect", { replace: true });
    }
  }, [session, navigate]);

  if (!session) return null;

  const handleSelect = async (role: Role) => {
    try {
      setError(null);
      setLoadingRole(role);

      await setActiveRole(role); 

      navigate("/redirect", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Failed to set role");
    } finally {
      setLoadingRole(null);
    }
  };

  if (!session.roles || session.roles.length === 0) {
    return (
      <Alert severity="error">
        No roles assigned to your account. Please contact an administrator.
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 420, margin: "0 auto", mt: 6 }}>
      <Typography variant="h5" fontWeight={700}>
        Choose how you want to continue
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {session.roles.map((role: Role) => (
        <Button
          key={role}
          variant="contained"
          size="large"
          disabled={!!loadingRole}
          onClick={() => handleSelect(role)}
        >
          {loadingRole === role
            ? "Loading..."
            : `Continue as ${role.replace("_", " ")}`}
        </Button>
      ))}
    </Stack>
  );
}
