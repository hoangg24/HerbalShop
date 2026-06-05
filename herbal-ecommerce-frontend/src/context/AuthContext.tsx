"use client";
// src/context/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "../types/auth";
import { authService } from "../services/auth.service";

// ── Types ──────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "hs_access_token";
const REFRESH_KEY = "hs_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const saveTokens = (at: string, rt: string) => {
    localStorage.setItem(TOKEN_KEY, at);
    localStorage.setItem(REFRESH_KEY, rt);
    setAccessToken(at);
  };

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      const at = localStorage.getItem(TOKEN_KEY);
      const rt = localStorage.getItem(REFRESH_KEY);

      if (!at || !rt) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authService.getMe(at);
        setUser(res.data);
        setAccessToken(at);
      } catch {
        try {
          const refreshRes = await authService.refreshToken(rt);
          const { accessToken: newAt, refreshToken: newRt } = refreshRes.data;
          saveTokens(newAt, newRt);
          const meRes = await authService.getMe(newAt);
          setUser(meRes.data);
        } catch {
          clearTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { user, accessToken: at, refreshToken: rt } = res.data;
    saveTokens(at, rt);
    setUser(user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await authService.register(data);
    const { user, accessToken: at, refreshToken: rt } = res.data;
    saveTokens(at, rt);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (rt) {
      await authService.logout(rt).catch(() => {});
    }
    clearTokens();
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!accessToken) return;
    const res = await authService.getMe(accessToken);
    setUser(res.data);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
