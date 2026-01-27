import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/api/client";

type SessionContextType = {
  session: any | null | undefined;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => void;
  setActiveRole: (role: string) => Promise<void>;
  clearActiveRole: () => Promise<void>; // ✅ ADD THIS
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // undefined = not loaded yet
  // null = unauthenticated
  const [session, setSession] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const clearActiveRole = async () => {
    console.log("[SessionProvider] clearActiveRole()");
    await axios.post("/api/auth/clear-active-role");
    await refreshSession();
  };

  const refreshSession = async () => {
    console.log("[SessionProvider] refreshSession() called");

    const token = localStorage.getItem("access_token");
    const loginType = localStorage.getItem("login_type");

    if (!token || !loginType) {
      console.log("[SessionProvider] No token or login type");
      setSession(null);
      setLoading(false);
      return;
    }

    const meEndpoint =
      loginType === "cdc"
        ? "/api/auth/me"
        : "/api/client-users/me";

    try {
      console.log(`[SessionProvider] Calling GET ${meEndpoint}`);
      const res = await axios.get(meEndpoint);

      setSession({
        actorType: loginType,
        ...res.data,
      });
    } catch (err) {
      console.error("[SessionProvider] /me failed", err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("login_type");
    setSession(null);
    window.location.href = "/signin";
  };
  const setActiveRole = async (role: string) => {
    console.log("[SessionProvider] setActiveRole:", role);
    await axios.post("/api/auth/set-active-role", { role });
    await refreshSession();
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        loading,
        refreshSession,
        logout,
        setActiveRole,
        clearActiveRole, 
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return ctx;
}
