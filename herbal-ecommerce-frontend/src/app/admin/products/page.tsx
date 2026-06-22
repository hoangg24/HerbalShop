"use client";
// src/app/admin/products/page.tsx

import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { productsService, Product } from "../../../services/products.service";
import {
  categoriesService,
  Category,
} from "../../../services/categories.service";
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    totalPages: number;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "active" | "draft" | "inactive"
  >("");
  const [categoryId, setCategoryId] = useState("");

  // Action
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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

  // Load categories 1 lần
  useEffect(() => {
    categoriesService.getCategories().then((r) => {
      const all: Category[] = [];
      (r.data || []).forEach((cat: Category) => {
        all.push(cat);
        cat.children?.forEach((sub) => all.push(sub));
      });
      setCategories(all);
    });
  }, []);

  // Fetch products
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await productsService.adminGetProducts({
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
          categoryId: categoryId || undefined,
        });
        setProducts(res.data || []);
        setMeta(res.meta || null);
      } catch (err) {
        showToast(getErrorMessage(err), "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [page, search, statusFilter, categoryId, refresh]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleStatus = async (product: Product) => {
    if (product.status === "draft") return;
    const newStatus = product.status === "active" ? "inactive" : "active";
    setActionLoading(product.id);
    try {
      await productsService.adminToggleStatus(product.id, newStatus);
      showToast(
        newStatus === "active"
          ? `Đã hiện sản phẩm "${product.name}"`
          : `Đã ẩn sản phẩm "${product.name}"`,
      );
      setRefresh((r) => r + 1);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Stats từ data hiện tại
  const stats = {
    total: meta?.total ?? 0,
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    inactive: products.filter((p) => p.status === "inactive").length,
  };

  return (
    <AdminLayout title="Quản lý sản phẩm">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Tổng sản phẩm",
            value: stats.total,
            icon: "📦",
            color: "blue",
            filter: "",
          },
          {
            label: "Đang bán",
            value: stats.active,
            icon: "✅",
            color: "emerald",
            filter: "active",
          },
          {
            label: "Nháp",
            value: stats.draft,
            icon: "📝",
            color: "slate",
            filter: "draft",
          },
          {
            label: "Đã ẩn",
            value: stats.inactive,
            icon: "🚫",
            color: "red",
            filter: "inactive",
          },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => {
              setStatusFilter(s.filter as "" | "active" | "draft" | "inactive");
              setPage(1);
            }}
            className={`bg-white rounded-2xl p-5 border shadow-sm text-left transition-all hover:shadow-md ${
              statusFilter === s.filter
                ? "border-blue-400 ring-2 ring-blue-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {s.value}
                </p>
              </div>
              <span className="text-3xl">{s.icon}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
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
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Tìm
            </button>
          </form>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value as "" | "active" | "draft" | "inactive",
              );
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="draft">Nháp</option>
            <option value="inactive">Đã ẩn</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.parentId ? `   └ ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter chips */}
        {(search || statusFilter || categoryId) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            {search && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                {`Tìm: "${search}"`}
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                {STATUS_CONFIG[statusFilter].label}
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setPage(1);
                  }}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            )}
            {categoryId && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                {categories.find((c) => c.id === categoryId)?.name}
                <button
                  onClick={() => {
                    setCategoryId("");
                    setPage(1);
                  }}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setStatusFilter("");
                setCategoryId("");
                setPage(1);
              }}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        )}
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
                  "Vendor",
                  "Giá",
                  "Tồn kho",
                  "Đã bán",
                  "Trạng thái",
                  "Ngày tạo",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div
                          className="h-4 bg-slate-100 rounded animate-pulse"
                          style={{ width: `${50 + Math.random() * 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <span className="text-4xl block mb-3">📦</span>
                    <p className="text-sm">Không tìm thấy sản phẩm nào</p>
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
                      <td className="px-4 py-4">
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
                            <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[160px]">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {product.category.name}
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700 whitespace-nowrap">
                          {product.vendor.shopName}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 whitespace-nowrap">
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
                      <td className="px-4 py-4">
                        <span
                          className={`text-sm font-medium ${
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock < 10
                                ? "text-amber-600"
                                : "text-slate-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          {product.unit}
                        </span>
                      </td>

                      {/* Sold */}
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {product.soldCount}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${status?.class}`}
                        >
                          {status?.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(product.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        {product.status === "draft" ? (
                          <span className="text-xs text-slate-400 italic">
                            Vendor quản lý
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(product)}
                            disabled={actionLoading === product.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                              product.status === "active"
                                ? "text-red-600 bg-red-50 hover:bg-red-100 border-red-200"
                                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                            }`}
                          >
                            {actionLoading === product.id ? (
                              <svg
                                className="w-3.5 h-3.5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                            ) : product.status === "active" ? (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                  />
                                </svg>
                                Ẩn
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Hiện
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)}
              </span>{" "}
              trong{" "}
              <span className="font-semibold text-slate-700">{meta.total}</span>{" "}
              sản phẩm
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                ← Trước
              </button>
              {[...Array(meta.totalPages)].map((_, i) => {
                const p = i + 1;
                if (
                  p === 1 ||
                  p === meta.totalPages ||
                  Math.abs(p - page) <= 1
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-sm rounded-lg border transition-colors ${
                        page === p
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (Math.abs(p - page) === 2)
                  return (
                    <span key={p} className="text-slate-400 text-sm px-1">
                      ...
                    </span>
                  );
                return null;
              })}
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
