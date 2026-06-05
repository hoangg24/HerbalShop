// src/services/auth.service.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ── Auth API calls ─────────────────────────────────────────────

export const authService = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post("/auth/register", body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    api.post("/auth/login", body).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }).then((r) => r.data),

  getMe: (accessToken: string) =>
    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (body: { token: string; password: string }) =>
    api.post("/auth/reset-password", body).then((r) => r.data),

  changePassword: (
    body: { currentPassword: string; newPassword: string },
    accessToken: string,
  ) =>
    api
      .post("/auth/change-password", body, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((r) => r.data),
};
