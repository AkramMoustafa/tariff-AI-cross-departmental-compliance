import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/api/client";

const SessionContext = createContext<any>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("/api/auth/me")
      .then(res => setSession(res.data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
