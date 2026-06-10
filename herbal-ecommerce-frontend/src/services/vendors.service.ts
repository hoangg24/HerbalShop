// src/services/vendors.service.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeader = () => {
  const token = localStorage.getItem("hs_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const vendorsService = {
  // ── Buyer ────────────────────────────────────────────────
  registerVendor: (body: {
    shopName: string;
    description?: string;
    bankAccount?: string;
    bankName?: string;
  }) =>
    api
      .post("/vendors/register", body, { headers: getAuthHeader() })
      .then((r) => r.data),

  getMyVendor: () =>
    api.get("/vendors/me", { headers: getAuthHeader() }).then((r) => r.data),

  updateMyVendor: (body: {
    shopName?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    bankAccount?: string;
    bankName?: string;
  }) =>
    api
      .patch("/vendors/me", body, { headers: getAuthHeader() })
      .then((r) => r.data),

  // ── Public ───────────────────────────────────────────────
  getVendorBySlug: (slug: string) =>
    api.get(`/vendors/shop/${slug}`).then((r) => r.data),

  // ── Admin ────────────────────────────────────────────────
  getVendors: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) =>
    api
      .get("/vendors", { headers: getAuthHeader(), params })
      .then((r) => r.data),

  getVendorById: (id: string) =>
    api.get(`/vendors/${id}`, { headers: getAuthHeader() }).then((r) => r.data),

  reviewVendor: (
    id: string,
    body: { status: "active" | "suspended"; reason?: string },
  ) =>
    api
      .patch(`/vendors/${id}/review`, body, { headers: getAuthHeader() })
      .then((r) => r.data),

  updateCommissionRate: (id: string, commissionRate: number) =>
    api
      .patch(
        `/vendors/${id}/commission`,
        { commissionRate },
        { headers: getAuthHeader() },
      )
      .then((r) => r.data),
};
