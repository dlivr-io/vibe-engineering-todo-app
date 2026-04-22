"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const r = await api.get<User>("/users/me");
        setUser(r.data);
      } catch {
        localStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", r.data.access_token);
    const me = await api.get<User>("/users/me");
    setUser(me.data);
    router.push("/todos");
  };

  const register = async (email: string, password: string) => {
    await api.post("/auth/register", { email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/auth/login");
  };

  return { user, loading, login, register, logout };
}