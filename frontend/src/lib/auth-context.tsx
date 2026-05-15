"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "./api";

interface User { id: string; email: string; full_name: string; plan: string; scan_count_month: number; }
interface AuthCtx { user: User | null; loading: boolean; login: (a: string, r: string) => void; logout: () => void; }

const Ctx = createContext<AuthCtx>({ user: null, loading: true, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }
    apiFetch<User>("/api/auth/me")
      .then(setUser)
      .catch(() => localStorage.removeItem("access_token"))
      .finally(() => setLoading(false));
  }, []);

  function login(access: string, refresh: string) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    apiFetch<User>("/api/auth/me").then(setUser);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
