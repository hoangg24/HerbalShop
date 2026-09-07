// src/services/cart.service.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const getAuthHeader = () => {
  const token = localStorage.getItem("hs_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CartItemDTO {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  isAvailable: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    stock: number;
    unit: string;
    status: string;
    image: string | null;
    vendor: { id: string; shopName: string; slug: string };
  };
}

export interface CartDTO {
  items: CartItemDTO[];
  totalItems: number;
  subtotal: number;
}

export const cartService = {
  getCart: () =>
    api.get("/cart", { headers: getAuthHeader() }).then((r) => r.data),

  addItem: (productId: string, quantity: number) =>
    api
      .post(
        "/cart/items",
        { productId, quantity },
        { headers: getAuthHeader() },
      )
      .then((r) => r.data),

  updateItem: (productId: string, quantity: number) =>
    api
      .patch(
        `/cart/items/${productId}`,
        { quantity },
        { headers: getAuthHeader() },
      )
      .then((r) => r.data),

  removeItem: (productId: string) =>
    api
      .delete(`/cart/items/${productId}`, { headers: getAuthHeader() })
      .then((r) => r.data),

  clearCart: () =>
    api.delete("/cart", { headers: getAuthHeader() }).then((r) => r.data),

  syncCart: (items: { productId: string; quantity: number }[]) =>
    api
      .post("/cart/sync", { items }, { headers: getAuthHeader() })
      .then((r) => r.data),
};
