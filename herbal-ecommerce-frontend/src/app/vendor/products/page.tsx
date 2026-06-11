"use client";
// src/app/vendor/products/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { VendorLayout } from "../../../components/vendor/VendorLayout";
import { productsService, Product } from "../../../services/products.service";
import { getErrorMessage } from "../../../utils/error";

const STATUS_CONFIG = {
  active: {
    label: "Đang bán",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  draft: {
    label: "Nháp",
    class: "bg-slate-50 text-slate-600 border-slate-200",
  },
  inactive: { label: "Đã ẩn", class: "bg-red-50 text-red-600 border-red-200" },
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await productsService.getMyProducts({
          page,
          limit: 10,
          search: search || undefined,
          status:
            statusFilter === ""
              ? undefined
              : (statusFilter as "active" | "draft" | "inactive"),
        });
        setProducts(res.data || []);
        setTotal(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      } catch (err) {
        showToast(getErrorMessage(err), "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [page, search, statusFilter, refresh]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    try {
      await productsService.updateProduct(product.id, {
        status: newStatus as unknown,
      });
      showToast(
        newStatus === "active" ? "Đã hiển thị sản phẩm" : "Đã ẩn sản phẩm",
      );
      setRefresh((r) => r + 1);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productsService.deleteProduct(deleteTarget.id);
      showToast("Đã xóa sản phẩm");
      setDeleteTarget(null);
      setRefresh((r) => r + 1);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <VendorLayout title="Quản lý sản phẩm">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng sản phẩm", value: total, icon: "📦" },
          {
            label: "Đang bán",
            value: products.filter((p) => p.status === "active").length,
            icon: "✅",
          },
          {
            label: "Đã ẩn / Nháp",
            value: products.filter((p) => p.status !== "active").length,
            icon: "👁️",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  {s.value}
                </p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm tên sản phẩm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Tìm
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="draft">Nháp</option>
            <option value="inactive">Đã ẩn</option>
          </select>

          <Link href="/vendor/products/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors whitespace-nowrap">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Thêm sản phẩm
            </button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  "Sản phẩm",
                  "Danh mục",
                  "Giá",
                  "Tồn kho",
                  "Đã bán",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <span className="text-4xl block mb-3">📦</span>
                    <p className="text-sm mb-4">Chưa có sản phẩm nào</p>
                    <Link href="/vendor/products/create">
                      <button className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                        Thêm sản phẩm đầu tiên
                      </button>
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const primaryImage =
                    product.images.find((img) => img.isPrimary) ||
                    product.images[0];
                  const status =
                    STATUS_CONFIG[product.status as keyof typeof STATUS_CONFIG];
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                🌿
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate max-w-[180px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {product.category.name}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-emerald-700">
                          {formatPrice(product.salePrice ?? product.price)}
                        </p>
                        {product.salePrice && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-medium ${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-600" : "text-slate-700"}`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          {product.unit}
                        </span>
                      </td>

                      {/* Sold */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {product.soldCount}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${status?.class}`}
                        >
                          {status?.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/vendor/products/edit/${product.id}`}>
                            <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                              Sửa
                            </button>
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                              product.status === "active"
                                ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200"
                                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                            }`}
                          >
                            {product.status === "active" ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Tổng <span className="font-semibold text-slate-700">{total}</span>{" "}
              sản phẩm
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                ←
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === i + 1 ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Xóa sản phẩm</h3>
            <p className="text-sm text-slate-500 mb-1">
              Bạn chắc chắn muốn xóa{" "}
              <span className="font-semibold text-slate-700">{`"${deleteTarget.name}"`}</span>
              ?
            </p>
            <p className="text-xs text-red-400 mb-6">
              Sản phẩm đã có đơn hàng sẽ không thể xóa
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
