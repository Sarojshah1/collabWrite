const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

const TOKEN_KEY = "cw_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    credentials: "include",
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }
  return data?.data ?? data; // backend wraps in { data }
}

export async function apiRegister(payload: { name: string; email: string; password: string; bio?: string }): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  return data;
}

export async function apiLogin(payload: { email: string; password: string }): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  return data;
}

export async function apiMe(): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>("/auth/profile", { method: "GET" });
}
