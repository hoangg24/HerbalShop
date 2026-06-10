"use client";
// src/app/admin/categories/page.tsx

import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import {
  categoriesService,
  Category,
} from "../../../services/categories.service";
import { getErrorMessage } from "../../../utils/error";

interface FormState {
  name: string;
  parentId: string;
  imageUrl: string;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  parentId: "",
  imageUrl: "",
  sortOrder: "0",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Modal state
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
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
        const res = await categoriesService.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        showToast(getErrorMessage(err), "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [refresh]);

  // Flatten categories for parent select (chỉ lấy danh mục cha)
  const parentOptions = categories.filter((c) => !c.parentId);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditTarget(null);
    setModal("create");
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      parentId: cat.parentId || "",
      imageUrl: cat.imageUrl || "",
      sortOrder: String(cat.sortOrder),
    });
    setFormErrors({});
    setEditTarget(cat);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim() || form.name.length < 2)
      e.name = "Tên phải có ít nhất 2 ký tự";
    if (form.imageUrl && !/^https?:\/\/.+/.test(form.imageUrl))
      e.imageUrl = "URL không hợp lệ";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        parentId: form.parentId || undefined,
        imageUrl: form.imageUrl || undefined,
        sortOrder: parseInt(form.sortOrder) || 0,
      };

      if (modal === "create") {
        await categoriesService.createCategory(payload);
        showToast("Tạo danh mục thành công");
      } else if (editTarget) {
        await categoriesService.updateCategory(editTarget.id, {
          ...payload,
          parentId: form.parentId || null,
        });
        showToast("Cập nhật danh mục thành công");
      }
      closeModal();
      setRefresh((r) => r + 1);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await categoriesService.deleteCategory(deleteTarget.id);
      showToast("Đã xóa danh mục");
      setDeleteTarget(null);
      setRefresh((r) => r + 1);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Tổng số sản phẩm bao gồm cả sub
  const getTotalProducts = (cat: Category): number => {
    const own = cat._count?.products || 0;
    const sub =
      cat.children?.reduce((sum, c) => sum + (c._count?.products || 0), 0) || 0;
    return own + sub;
  };

  return (
    <AdminLayout title="Quản lý danh mục">
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">
            Tổng{" "}
            <span className="font-semibold text-slate-700">
              {categories.length}
            </span>{" "}
            danh mục
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
        >
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
          Thêm danh mục
        </button>
      </div>

      {/* Categories tree */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse"
            >
              <div className="h-4 bg-slate-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/6" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <span className="text-5xl block mb-4">📂</span>
          <p className="text-lg font-semibold text-slate-700 mb-2">
            Chưa có danh mục nào
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Tạo danh mục để vendor có thể đăng sản phẩm
          </p>
          <button
            onClick={openCreate}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Tạo danh mục đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Parent category */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Icon/Image */}
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">📂</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      /{cat.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>📦 {getTotalProducts(cat)} sản phẩm</span>
                    {cat.children && cat.children.length > 0 && (
                      <span>📁 {cat.children.length} danh mục con</span>
                    )}
                    <span>Thứ tự: {cat.sortOrder}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setForm({ ...EMPTY_FORM, parentId: cat.id });
                      setFormErrors({});
                      setEditTarget(null);
                      setModal("create");
                    }}
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Thêm con
                  </button>
                  <button
                    onClick={() => openEdit(cat)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Sub categories */}
              {cat.children && cat.children.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  {cat.children.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-4 px-5 py-3 ${
                        idx < cat.children!.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <div className="w-5 flex-shrink-0 flex items-center justify-center">
                        <span className="text-slate-300 text-sm">└</span>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {sub.imageUrl ? (
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm">📄</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-700">
                            {sub.name}
                          </p>
                          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            /{sub.slug}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          📦 {sub._count?.products || 0} sản phẩm · Thứ tự:{" "}
                          {sub.sortOrder}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEdit(sub)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sub)}
                          className="px-3 py-1 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">
                {modal === "create"
                  ? "Thêm danh mục"
                  : `Sửa: ${editTarget?.name}`}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Thảo mộc khô"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    setFormErrors((p) => ({ ...p, name: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-400" : "border-slate-200"}`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Parent */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Danh mục cha
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, parentId: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={!!editTarget?.children?.length}
                >
                  <option value="">— Danh mục gốc —</option>
                  {parentOptions
                    .filter((p) => p.id !== editTarget?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
                {editTarget?.children?.length ? (
                  <p className="text-xs text-amber-500 mt-1">
                    ⚠️ Danh mục có con không thể đổi thành danh mục con
                  </p>
                ) : null}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, imageUrl: e.target.value }));
                    setFormErrors((p) => ({ ...p, imageUrl: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.imageUrl ? "border-red-400" : "border-slate-200"}`}
                />
                {formErrors.imageUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.imageUrl}
                  </p>
                )}
                {form.imageUrl && !formErrors.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="mt-2 w-16 h-16 object-cover rounded-xl border border-slate-200"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>

              {/* Sort order */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sortOrder: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Số nhỏ hơn hiển thị trước
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : modal === "create"
                    ? "Tạo danh mục"
                    : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
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
            <h3 className="font-semibold text-slate-800 mb-2">Xóa danh mục</h3>
            <p className="text-sm text-slate-500 mb-1">
              Bạn chắc chắn muốn xóa{" "}
              <span className="font-semibold text-slate-700">
                <p>{`Bạn có chắc chắn muốn xóa "${deleteTarget.name}" không?`}</p>
              </span>
              ?
            </p>
            <p className="text-xs text-red-400 mb-6">
              Hành động này không thể hoàn tác
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
    </AdminLayout>
  );
}
