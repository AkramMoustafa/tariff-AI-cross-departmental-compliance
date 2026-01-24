import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

export default function AutoRole() {
  const { session, setActiveRole } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;

    if (!session.active_role && session.roles.length === 1) {
      console.log("[AutoRole] Auto-setting role:", session.roles[0]);

      setActiveRole(session.roles[0]).then(() => {
        navigate("/compliance", { replace: true });
      });
    }
  }, [session]);

  return <div>Setting up your workspace…</div>;
}