// src/services/products.service.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeader = () => {
  const token = localStorage.getItem("hs_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock: number;
  unit: string;
  status: string;
  soldCount: number;
  viewCount: number;
  createdAt: string;
  vendor: { id: string; shopName: string; slug: string; logoUrl?: string };
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; altText?: string; isPrimary: boolean }[];
  _count: { reviews: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "price" | "soldCount" | "viewCount";
  sortOrder?: "asc" | "desc";
}

export const productsService = {
  // ── Public ──────────────────────────────────────────────
  getProducts: (params?: ProductsQuery) =>
    api.get("/products", { params }).then((r) => r.data),

  getProductBySlug: (slug: string) =>
    api.get(`/products/${slug}`).then((r) => r.data),

  // ── Vendor ──────────────────────────────────────────────
  getMyProducts: (params?: ProductsQuery) =>
    api
      .get("/products/vendor/my", { headers: getAuthHeader(), params })
      .then((r) => r.data),

  createProduct: (body: {
    name: string;
    categoryId: string;
    description?: string;
    price: number;
    salePrice?: number;
    stock: number;
    unit?: string;
    weight?: number;
    status?: string;
  }) =>
    api
      .post("/products", body, { headers: getAuthHeader() })
      .then((r) => r.data),

  updateProduct: (id: string, body: object) =>
    api
      .patch(`/products/${id}`, body, { headers: getAuthHeader() })
      .then((r) => r.data),

  deleteProduct: (id: string) =>
    api
      .delete(`/products/${id}`, { headers: getAuthHeader() })
      .then((r) => r.data),

  addProductImages: (
    id: string,
    images: { url: string; isPrimary?: boolean; sortOrder?: number }[],
  ) =>
    api
      .post(`/products/${id}/images`, { images }, { headers: getAuthHeader() })
      .then((r) => r.data),

  deleteProductImage: (id: string, imageId: string) =>
    api
      .delete(`/products/${id}/images/${imageId}`, { headers: getAuthHeader() })
      .then((r) => r.data),

  // ── Admin ────────────────────────────────────────────────
  adminGetProducts: (params?: ProductsQuery) =>
    api
      .get("/products/admin/all", { headers: getAuthHeader(), params })
      .then((r) => r.data),

  adminToggleStatus: (id: string, status: "active" | "inactive") =>
    api
      .patch(
        `/products/admin/${id}/status`,
        { status },
        { headers: getAuthHeader() },
      )
      .then((r) => r.data),
};
