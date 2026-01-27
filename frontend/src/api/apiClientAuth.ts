import { BASE_URL } from "./client";
// src/api/apiClinetAuth.ts

export interface ClientUserSignupPayload {
  tenant_id: string;
  email: string;
  password: string;
}

export interface ClientUserLoginPayload {

  email: string;
  password: string;
}

export interface ClientAuthResponse {
  client_user_id: string;
  email: string;

  access_token: string;
  token_type: "bearer";
}

export interface ClientUserSession {
  client_user_id: string;
  email: string;

}

const TOKEN_KEY = "client_user_token";

export function setClientUserToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getClientUserToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearClientUserToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getClientUserToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function signupClientUser(
  payload: ClientUserSignupPayload
): Promise<ClientAuthResponse> {
  const data = await apiFetch<ClientAuthResponse>(
    "/api/client-users/signup",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  setClientUserToken(data.access_token);
  return data;
}

export async function loginClientUser(
  payload: ClientUserLoginPayload
): Promise<ClientAuthResponse> {
  const data = await apiFetch<ClientAuthResponse>(
    "/api/client-users/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  setClientUserToken(data.access_token);
  return data;
}

export async function getCurrentClientUser(): Promise<ClientUserSession> {
  return apiFetch<ClientUserSession>("/api/client-users/me", {
    method: "GET",
  });
}

export function logoutClientUser() {
  clearClientUserToken();
}