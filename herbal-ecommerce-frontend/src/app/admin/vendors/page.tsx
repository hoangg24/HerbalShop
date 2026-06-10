"use client";
// src/app/admin/vendors/page.tsx

import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { vendorsService } from "../../../services/vendors.service";
import { getErrorMessage } from "../../../utils/error";

interface Vendor {
  id: string;
  shopName: string;
  slug: string;
  status: "pending" | "active" | "suspended";
  commissionRate: number;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
  _count: { products: number };
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG = {
  pending: { label: "Chờ duyệt", class: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Hoạt động", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  suspended: { label: "Tạm ngưng", class: "bg-red-50 text-red-600 border-red-200" },
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [detailModal, setDetailModal] = useState<Vendor | null>(null);
  const [commissionModal, setCommissionModal] = useState<{ vendor: Vendor; value: string } | null>(null);
  const [refresh, setRefresh] = useState(0);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await vendorsService.getVendors({
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setVendors(res.data);
        setMeta(res.meta);
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

  const handleReview = async (vendor: Vendor, status: "active" | "suspended") => {
    setActionLoading(vendor.id + "_" + status);
    try {
      await vendorsService.reviewVendor(vendor.id, { status });
      showToast(status === "active" ? `Đã duyệt shop ${vendor.shopName}` : `Đã tạm ngưng shop ${vendor.shopName}`);
      setDetailModal(null);
      setRefresh((r) => r + 1);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCommission = async () => {
    if (!commissionModal) return;
    const value = parseFloat(commissionModal.value);
    if (isNaN(value) || value < 0 || value > 100) {
      showToast("Commission rate phải từ 0 đến 100", "error");
      return;
    }
    setActionLoading(commissionModal.vendor.id + "_commission");
    try {
      await vendorsService.updateCommissionRate(commissionModal.vendor.id, value);
      showToast("Cập nhật hoa hồng thành công");
      setCommissionModal(null);
      setRefresh((r) => r + 1);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = statusFilter === "pending" ? meta?.total : undefined;

  return (
    <AdminLayout title="Quản lý nhà cung cấp">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Chờ duyệt", status: "pending", icon: "⏳", color: "amber" },
          { label: "Đang hoạt động", status: "active", icon: "✅", color: "emerald" },
          { label: "Tạm ngưng", status: "suspended", icon: "🔒", color: "red" },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() => { setStatusFilter(s.status); setPage(1); }}
            className={`bg-white rounded-2xl p-5 border shadow-sm text-left transition-all hover:shadow-md ${
              statusFilter === s.status ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {statusFilter === s.status && meta ? meta.total : "—"}
                </p>
              </div>
              <span className="text-3xl">{s.icon}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm tên shop, email chủ shop..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Tìm
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Shop", "Chủ shop", "Sản phẩm", "Hoa hồng", "Trạng thái", "Ngày đăng ký", "Thao tác"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
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
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <span className="text-4xl block mb-2">🏪</span>
                    <p className="text-sm">Không có shop nào</p>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Shop */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {vendor.shopName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{vendor.shopName}</p>
                          <p className="text-xs text-slate-400">@{vendor.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Chủ shop */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">{vendor.user.name}</p>
                      <p className="text-xs text-slate-400">{vendor.user.email}</p>
                    </td>

                    {/* Sản phẩm */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {vendor._count.products}
                    </td>

                    {/* Hoa hồng */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setCommissionModal({ vendor, value: String(vendor.commissionRate) })}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {vendor.commissionRate}%
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_CONFIG[vendor.status].class}`}>
                        {STATUS_CONFIG[vendor.status].label}
                      </span>
                    </td>

                    {/* Ngày */}
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(vendor.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Xem chi tiết */}
                        <button
                          onClick={() => setDetailModal(vendor)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        >
                          Chi tiết
                        </button>

                        {/* Duyệt */}
                        {vendor.status === "pending" && (
                          <button
                            onClick={() => handleReview(vendor, "active")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === vendor.id + "_active" ? "..." : "Duyệt"}
                          </button>
                        )}

                        {/* Tạm ngưng */}
                        {vendor.status === "active" && (
                          <button
                            onClick={() => handleReview(vendor, "suspended")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === vendor.id + "_suspended" ? "..." : "Ngưng"}
                          </button>
                        )}

                        {/* Kích hoạt lại */}
                        {vendor.status === "suspended" && (
                          <button
                            onClick={() => handleReview(vendor, "active")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
                          >
                            Kích hoạt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{meta.total}</span> shop
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                ←
              </button>
              {[...Array(meta.totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 text-sm rounded-lg border transition-colors ${page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">Chi tiết shop</h3>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "Tên shop", value: detailModal.shopName },
                { label: "Slug", value: `@${detailModal.slug}` },
                { label: "Chủ shop", value: detailModal.user.name },
                { label: "Email", value: detailModal.user.email },
                { label: "Điện thoại", value: detailModal.user.phone || "—" },
                { label: "Sản phẩm", value: String(detailModal._count.products) },
                { label: "Hoa hồng", value: `${detailModal.commissionRate}%` },
                { label: "Ngày đăng ký", value: new Date(detailModal.createdAt).toLocaleDateString("vi-VN") },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {detailModal.status === "pending" && (
                <button
                  onClick={() => handleReview(detailModal, "active")}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  ✅ Duyệt shop
                </button>
              )}
              {detailModal.status === "active" && (
                <button
                  onClick={() => handleReview(detailModal, "suspended")}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  🔒 Tạm ngưng
                </button>
              )}
              {detailModal.status === "suspended" && (
                <button
                  onClick={() => handleReview(detailModal, "active")}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Kích hoạt lại
                </button>
              )}
              <button onClick={() => setDetailModal(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commissionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-1">Cập nhật hoa hồng</h3>
            <p className="text-sm text-slate-500 mb-4">{commissionModal.vendor.shopName}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Commission rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionModal.value}
                onChange={(e) => setCommissionModal({ ...commissionModal, value: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setCommissionModal(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Huỷ
              </button>
              <button
                onClick={handleUpdateCommission}
                disabled={!!actionLoading}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
