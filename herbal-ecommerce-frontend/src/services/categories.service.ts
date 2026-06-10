// src/services/categories.service.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeader = () => {
  const token = localStorage.getItem("hs_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  children?: Category[];
  _count?: { products: number };
}

export const categoriesService = {
  getCategories: () => api.get("/categories").then((r) => r.data),

  getCategoryBySlug: (slug: string) =>
    api.get(`/categories/${slug}`).then((r) => r.data),

  createCategory: (body: {
    name: string;
    parentId?: string;
    imageUrl?: string;
    sortOrder?: number;
  }) =>
    api
      .post("/categories", body, { headers: getAuthHeader() })
      .then((r) => r.data),

  updateCategory: (
    id: string,
    body: {
      name?: string;
      parentId?: string | null;
      imageUrl?: string;
      sortOrder?: number;
    },
  ) =>
    api
      .patch(`/categories/${id}`, body, { headers: getAuthHeader() })
      .then((r) => r.data),

  deleteCategory: (id: string) =>
    api
      .delete(`/categories/${id}`, { headers: getAuthHeader() })
      .then((r) => r.data),
};
