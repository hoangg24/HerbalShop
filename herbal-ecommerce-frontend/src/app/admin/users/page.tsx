"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { usersService } from "../../../services/users.service";
import { getErrorMessage } from "../../../utils/error";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "vendor" | "buyer";
  phone?: string;
  isActive: boolean;
  createdAt: string;
  vendor?: { shopName: string; status: string } | null;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROLE_CONFIG = {
  admin: {
    label: "Quản trị viên",
    class: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
  vendor: {
    label: "Nhà vườn (Vendor)",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  buyer: {
    label: "Khách hàng (Buyer)",
    class: "bg-slate-50 text-slate-600 border-slate-200/60",
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Biến cờ hiệu để kích hoạt lại useEffect fetch dữ liệu thủ công khi cần
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Role modal
  const [roleModal, setRoleModal] = useState<{
    user: User;
    newRole: string;
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * THAY ĐỔI 1: Hợp nhất logic API vào một useEffect duy nhất.
   * Xử lý triệt để lỗi "cascading renders" và lỗi Race Condition.
   */
  useEffect(() => {
    let isMounted = true;

    const fetchUsersData = async () => {
      setIsLoading(true);
      try {
        const res = await usersService.getUsers({
          page,
          limit: 10,
          search: search || undefined,
          role: roleFilter || undefined,
        });

        if (isMounted) {
          setUsers(res.data);
          setMeta(res.meta);
        }
      } catch (err) {
        if (isMounted) {
          setToast({ message: getErrorMessage(err), type: "error" });
          setTimeout(() => setToast(null), 3000);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUsersData();

    return () => {
      isMounted = false;
    };
  }, [page, search, roleFilter, refreshTrigger]); // Theo dõi trực tiếp các bộ lọc và lệnh refresh

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  /**
   * THAY ĐỔI 2: Thay thế lệnh fetchUsers() bằng cách tăng refreshTrigger lên 1 đơn vị.
   */
  const handleToggleActive = async (user: User) => {
    setActionLoading(user.id + "_active");
    try {
      await usersService.toggleUserActive(user.id);
      showToast(
        user.isActive
          ? `Đã khoá tài khoản ${user.name}`
          : `Đã mở khoá ${user.name}`,
      );
      setRefreshTrigger((prev) => prev + 1); // Kích hoạt useEffect chạy lại
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleModal) return;
    setActionLoading(roleModal.user.id + "_role");
    try {
      await usersService.updateUserRole(roleModal.user.id, roleModal.newRole);
      showToast(
        `Đã đổi role ${roleModal.user.name} thành ${roleModal.newRole}`,
      );
      setRoleModal(null);
      setRefreshTrigger((prev) => prev + 1); // Kích hoạt useEffect chạy lại
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout title="Quản lý người dùng">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Tổng người dùng",
            value: meta?.total ?? "—",
            color: "blue",
            icon: "👥",
          },
          {
            label: "Đang hoạt động",
            value: users.filter((u) => u.isActive).length,
            color: "emerald",
            icon: "✅",
          },
          {
            label: "Bị khoá",
            value: users.filter((u) => !u.isActive).length,
            color: "red",
            icon: "🔒",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-5">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
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
                placeholder="Tìm tên, email, số điện thoại..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Tìm
            </button>
          </form>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="">Tất cả role</option>
            <option value="admin">Admin</option>
            <option value="vendor">Vendor</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  "Người dùng",
                  "Role",
                  "Shop",
                  "Trạng thái",
                  "Ngày tạo",
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
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div
                          className="h-4 bg-slate-100 rounded animate-pulse"
                          style={{ width: `${60 + Math.random() * 30}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">🔍</span>
                      <p className="text-sm">Không tìm thấy người dùng nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${ROLE_CONFIG[user.role].class}`}
                      >
                        {ROLE_CONFIG[user.role].label}
                      </span>
                    </td>

                    {/* Shop */}
                    <td className="px-5 py-4">
                      {user.vendor ? (
                        <div>
                          <p className="text-sm text-slate-700">
                            {user.vendor.shopName}
                          </p>
                          <span
                            className={`text-xs ${user.vendor.status === "active" ? "text-emerald-600" : "text-amber-600"}`}
                          >
                            {user.vendor.status === "active"
                              ? "● Hoạt động"
                              : "● Chờ duyệt"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                        />
                        {user.isActive ? "Hoạt động" : "Bị khoá"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Đổi role */}
                        <button
                          onClick={() =>
                            setRoleModal({ user, newRole: user.role })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
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
                              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                            />
                          </svg>
                          Role
                        </button>

                        {/* Khoá/mở */}
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={actionLoading === user.id + "_active"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                            user.isActive
                              ? "text-red-600 bg-red-50 hover:bg-red-100 border-red-200"
                              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                          } disabled:opacity-50`}
                        >
                          {actionLoading === user.id + "_active" ? (
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
                          ) : user.isActive ? (
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          ) : (
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
                                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                          {user.isActive ? "Khoá" : "Mở"}
                        </button>
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
              Hiển thị{" "}
              <span className="font-medium text-slate-700">
                {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              trong{" "}
              <span className="font-medium text-slate-700">{meta.total}</span>{" "}
              người dùng
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>
              {[...Array(meta.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 text-sm rounded-lg border transition-colors ${
                    page === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                👤
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Đổi role</h3>
                <p className="text-sm text-slate-500">{roleModal.user.name}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {(["buyer", "vendor", "admin"] as const).map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    roleModal.newRole === role
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={roleModal.newRole === role}
                    onChange={() =>
                      setRoleModal({ ...roleModal, newRole: role })
                    }
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700 capitalize">
                      {ROLE_CONFIG[role].label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {role === "buyer"
                        ? "Mua hàng, xem sản phẩm"
                        : role === "vendor"
                          ? "Bán hàng, quản lý shop"
                          : "Toàn quyền hệ thống"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRoleModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={
                  !!actionLoading || roleModal.newRole === roleModal.user.role
                }
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
