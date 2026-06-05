// src/services/users.service.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const getAuthHeader = () => {
  const token = localStorage.getItem("hs_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const usersService = {
  // ── Profile ───────────────────────────────────────────────
  getProfile: () =>
    api.get("/users/profile", { headers: getAuthHeader() }).then((r) => r.data),

  updateProfile: (body: { name?: string; phone?: string; avatar?: string }) =>
    api
      .patch("/users/profile", body, { headers: getAuthHeader() })
      .then((r) => r.data),

  // ── Addresses ────────────────────────────────────────────
  getAddresses: () =>
    api
      .get("/users/addresses", { headers: getAuthHeader() })
      .then((r) => r.data),

  createAddress: (body: {
    fullName: string;
    phone: string;
    addressLine: string;
    ward?: string;
    district: string;
    city: string;
    isDefault?: boolean;
  }) =>
    api
      .post("/users/addresses", body, { headers: getAuthHeader() })
      .then((r) => r.data),

  updateAddress: (id: string, body: object) =>
    api
      .patch(`/users/addresses/${id}`, body, { headers: getAuthHeader() })
      .then((r) => r.data),

  deleteAddress: (id: string) =>
    api
      .delete(`/users/addresses/${id}`, { headers: getAuthHeader() })
      .then((r) => r.data),

  setDefaultAddress: (id: string) =>
    api
      .patch(
        `/users/addresses/${id}/set-default`,
        {},
        { headers: getAuthHeader() },
      )
      .then((r) => r.data),

  // ── Admin ────────────────────────────────────────────────
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: string;
  }) =>
    api.get("/users", { headers: getAuthHeader(), params }).then((r) => r.data),

  getUserById: (id: string) =>
    api.get(`/users/${id}`, { headers: getAuthHeader() }).then((r) => r.data),

  updateUserRole: (id: string, role: string) =>
    api
      .patch(`/users/${id}/role`, { role }, { headers: getAuthHeader() })
      .then((r) => r.data),

  toggleUserActive: (id: string) =>
    api
      .patch(`/users/${id}/toggle-active`, {}, { headers: getAuthHeader() })
      .then((r) => r.data),
};
