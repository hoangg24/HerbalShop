"use client";
// src/context/CartContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { cartService, CartItemDTO } from "../services/cart.service";
import { Product } from "../services/products.service";

// ── Types ──────────────────────────────────────────────────────
interface CartState {
  items: CartItemDTO[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
}

type CartPayload = {
  items: CartItemDTO[];
  totalItems: number;
  subtotal: number;
};

type CartAction =
  | { type: "SET_CART"; payload: CartPayload }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: true,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART":
      return { ...state, ...action.payload, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ── Guest cart (localStorage) ────────────────────────────────
const GUEST_CART_KEY = "hs_guest_cart";

interface GuestCartItem {
  productId: string;
  quantity: number;
  product: Product;
}

const readGuestCart = (): GuestCartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items: GuestCartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const guestItemToDTO = (item: GuestCartItem): CartItemDTO => {
  const unitPrice = item.product.salePrice ?? item.product.price;
  return {
    id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice,
    itemTotal: unitPrice * item.quantity,
    isAvailable:
      item.product.status === "active" && item.product.stock >= item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      stock: item.product.stock,
      unit: item.product.unit,
      status: item.product.status,
      image:
        item.product.images.find((img) => img.isPrimary)?.url ??
        item.product.images[0]?.url ??
        null,
      vendor: {
        id: item.product.vendor.id,
        shopName: item.product.vendor.shopName,
        slug: item.product.vendor.slug,
      },
    },
  };
};

const computeGuestTotals = (items: GuestCartItem[]): CartPayload => {
  const dtos = items.map(guestItemToDTO);
  return {
    items: dtos,
    totalItems: dtos.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: dtos.reduce((sum, i) => sum + i.itemTotal, 0),
  };
};

// ── Context ───────────────────────────────────────────────────
interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const hasSyncedRef = useRef(false);

  const loadServerCart = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    const res = await cartService.getCart();
    dispatch({ type: "SET_CART", payload: res.data });
  }, []);

  const loadGuestCart = useCallback(() => {
    dispatch({
      type: "SET_CART",
      payload: computeGuestTotals(readGuestCart()),
    });
  }, []);

  // Đồng bộ / khởi tạo giỏ hàng mỗi khi trạng thái đăng nhập thay đổi
  useEffect(() => {
    if (authLoading) return; // chờ AuthContext xác định login xong

    const init = async () => {
      if (isAuthenticated) {
        if (!hasSyncedRef.current) {
          hasSyncedRef.current = true;
          const guestItems = readGuestCart();
          if (guestItems.length > 0) {
            try {
              const res = await cartService.syncCart(
                guestItems.map((i) => ({
                  productId: i.productId,
                  quantity: i.quantity,
                })),
              );
              localStorage.removeItem(GUEST_CART_KEY);
              dispatch({ type: "SET_CART", payload: res.data });
              return;
            } catch {
              // Sync lỗi thì vẫn tiếp tục load cart hiện có trên server
            }
          }
        }
        await loadServerCart();
      } else {
        hasSyncedRef.current = false;
        loadGuestCart();
      }
    };

    init();
  }, [isAuthenticated, authLoading, loadServerCart, loadGuestCart]);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      if (isAuthenticated) {
        const res = await cartService.addItem(product.id, quantity);
        dispatch({ type: "SET_CART", payload: res.data });
        return;
      }

      const guestItems = readGuestCart();
      const existing = guestItems.find((i) => i.productId === product.id);
      const newQuantity = (existing?.quantity ?? 0) + quantity;

      if (newQuantity > product.stock) {
        throw {
          status: 400,
          message: `Chỉ còn ${product.stock} sản phẩm trong kho`,
        };
      }

      const updated = existing
        ? guestItems.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: newQuantity, product }
              : i,
          )
        : [
            ...guestItems,
            { productId: product.id, quantity: newQuantity, product },
          ];

      saveGuestCart(updated);
      dispatch({ type: "SET_CART", payload: computeGuestTotals(updated) });
    },
    [isAuthenticated],
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      if (isAuthenticated) {
        const res = await cartService.updateItem(productId, quantity);
        dispatch({ type: "SET_CART", payload: res.data });
        return;
      }

      const guestItems = readGuestCart();
      const target = guestItems.find((i) => i.productId === productId);
      if (!target) return;

      if (quantity > target.product.stock) {
        throw {
          status: 400,
          message: `Chỉ còn ${target.product.stock} sản phẩm trong kho`,
        };
      }

      const updated = guestItems.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      );
      saveGuestCart(updated);
      dispatch({ type: "SET_CART", payload: computeGuestTotals(updated) });
    },
    [isAuthenticated],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        const res = await cartService.removeItem(productId);
        dispatch({ type: "SET_CART", payload: res.data });
        return;
      }

      const updated = readGuestCart().filter((i) => i.productId !== productId);
      saveGuestCart(updated);
      dispatch({ type: "SET_CART", payload: computeGuestTotals(updated) });
    },
    [isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      await cartService.clearCart();
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    dispatch({
      type: "SET_CART",
      payload: { items: [], totalItems: 0, subtotal: 0 },
    });
  }, [isAuthenticated]);

  const refreshCart = useCallback(async () => {
    if (isAuthenticated) await loadServerCart();
    else loadGuestCart();
  }, [isAuthenticated, loadServerCart, loadGuestCart]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
