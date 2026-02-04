// src/api/useLogin.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/api/SessionProvider";

const rawEnvBase = import.meta.env.VITE_API_BASE_URL;

const BASE_URL =
  rawEnvBase && rawEnvBase.trim() !== ""
    ? rawEnvBase.trim()
    : window.location.hostname.includes("localhost")
    ? "http://localhost:8000"
    : "https://api.nomioc.com";

export function useLogin() {
  const navigate = useNavigate();
  const { refreshSession } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const login = async ({
    email,
    password,
    mode,
  }: {
    email: string;
    password: string;
    mode: "company" | "user";
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const endpoint =
      mode === "company"
        ? "/api/auth/login"
        : "/api/client-users/login-user";

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (!data.access_token) {
        throw new Error("Invalid login response");
      }

      if (mode === "user") {
        localStorage.setItem("client_user_token", data.access_token);
        localStorage.removeItem("access_token");
      } else {
        localStorage.setItem("access_token", data.access_token);
        localStorage.removeItem("client_user_token");
      }

      localStorage.setItem("login_type", mode);

      if (mode === "company") {
        await refreshSession();
        navigate("/redirect", { replace: true });
      } else {
        navigate("/tariffs", { replace: true });
      }

      setSuccess("Login successful");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, success };
}
