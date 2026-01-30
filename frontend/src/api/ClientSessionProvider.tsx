import { createContext, useContext, useEffect, useState } from "react";
import apiUserClient from "@/api/apiUserAuth";

type ClientSession = {
  client_user_id: string;
  email: string;
};

type ClientSessionContextType = {
  session: ClientSession | null | undefined;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => void;
};

const ClientSessionContext =
  createContext<ClientSessionContextType | null>(null);

export function ClientSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<ClientSession | null | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const token = localStorage.getItem("client_user_token");

    if (!token) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiUserClient.get("/api/client-users/me");
      setSession(res.data);
    } catch (err) {
      console.error("[ClientSessionProvider] /me failed", err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const logout = () => {
    localStorage.removeItem("client_user_token");
    localStorage.removeItem("login_type");
    setSession(null);
    window.location.href = "/signin";
  };

  return (
    <ClientSessionContext.Provider
      value={{
        session,
        loading,
        refreshSession,
        logout,
      }}
    >
      {children}
    </ClientSessionContext.Provider>
  );
}

export function useClientSession() {
  const ctx = useContext(ClientSessionContext);
  if (!ctx) {
    throw new Error(
      "useClientSession must be used inside ClientSessionProvider"
    );
  }
  return ctx;
}