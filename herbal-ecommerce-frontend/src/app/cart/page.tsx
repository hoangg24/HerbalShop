"use client";
// src/app/cart/page.tsx

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { getErrorMessage } from "../../utils/error";

const formatVND = (amount: number) => amount.toLocaleString("vi-VN") + "đ";

export default function CartPage() {
  const {
    items,
    totalItems,
    subtotal,
    isLoading,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setError(null);
    setPendingId(productId);
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setError(null);
    setPendingId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-500 mb-6">
          Hãy khám phá các sản phẩm thảo mộc của chúng tôi.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Giỏ hàng của bạn ({totalItems} sản phẩm)
      </h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className={`flex gap-4 p-4 bg-white border rounded-2xl ${
                item.isAvailable
                  ? "border-gray-100"
                  : "border-red-200 bg-red-50/40"
              }`}
            >
              <img
                src={item.product.image ?? "/placeholder-product.png"}
                alt={item.product.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
              />

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium text-gray-800 hover:text-emerald-700 line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.product.vendor.shopName}
                </p>

                {!item.isAvailable && (
                  <p className="text-xs text-red-500 mt-1">
                    Sản phẩm hiện không khả dụng hoặc không đủ số lượng
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      disabled={pendingId === item.productId}
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      disabled={pendingId === item.productId}
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productId)}
                    disabled={pendingId === item.productId}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-emerald-700 text-sm">
                  {formatVND(item.itemTotal)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatVND(item.unitPrice)}/{item.product.unit}
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={() =>
              clearCart().catch((err) => setError(getErrorMessage(err)))
            }
            className="text-xs text-gray-400 hover:text-red-500 mt-2"
          >
            Xóa toàn bộ giỏ hàng
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 h-fit sticky top-24">
          <h2 className="font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Tạm tính</span>
            <span>{formatVND(subtotal)}</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Phí vận chuyển sẽ được tính ở bước thanh toán
          </p>
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between mb-5">
            <span className="font-semibold text-gray-800">Tổng cộng</span>
            <span className="font-bold text-emerald-700 text-lg">
              {formatVND(subtotal)}
            </span>
          </div>
          <button
            disabled={items.some((i) => !i.isAvailable)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
          >
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
