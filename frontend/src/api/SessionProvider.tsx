import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/api/client";

type SessionContextType = {
  session: any | null | undefined;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => void;
  setActiveRole: (role: string) => Promise<void>;
  clearActiveRole: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    console.log("[SessionProvider] refreshSession() called");

    const token = localStorage.getItem("access_token");
    const loginType = localStorage.getItem("login_type");

    // 🚫 Only CDC users are allowed here
    if (loginType !== "cdc" || !token) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/auth/me");
      setSession({
        actorType: "cdc",
        ...res.data,
      });
    } catch (err) {
      console.error("[SessionProvider] /api/auth/me failed", err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useEffect is OUTSIDE refreshSession
  useEffect(() => {
    refreshSession();
  }, []);

  const clearActiveRole = async () => {
    await axios.post("/api/auth/clear-active-role");
    await refreshSession();
  };

  const setActiveRole = async (role: string) => {
    await axios.post("/api/auth/set-active-role", { role });
    await refreshSession();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("login_type");
    setSession(null);
    window.location.href = "/signin";
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