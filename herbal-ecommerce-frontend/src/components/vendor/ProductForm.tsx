"use client";
// src/components/vendor/ProductForm.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VendorLayout } from "./VendorLayout";
import { productsService, Product } from "../../services/products.service";
import { categoriesService, Category } from "../../services/categories.service";
import { getErrorMessage } from "../../utils/error";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
}

interface FormState {
  name: string;
  categoryId: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  unit: string;
  weight: string;
  status: "draft" | "active" | "inactive";
}

const EMPTY_FORM: FormState = {
  name: "", categoryId: "", description: "",
  price: "", salePrice: "", stock: "0",
  unit: "gói", weight: "", status: "draft",
};

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Images
  const [images, setImages] = useState<{ url: string; isPrimary: boolean; sortOrder: number }[]>(
    product?.images.map((img, i) => ({ url: img.url, isPrimary: img.isPrimary, sortOrder: i })) || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    categoriesService.getCategories().then((r) => {
      // Flatten: lấy cả parent và children
      const all: Category[] = [];
      (r.data || []).forEach((cat: Category) => {
        all.push(cat);
        cat.children?.forEach((sub) => all.push(sub));
      });
      setCategories(all);
    });
  }, []);

  useEffect(() => {
    if (product && mode === "edit") {
      setForm({
        name: product.name,
        categoryId: product.category.id,
        description: product.description || "",
        price: String(product.price),
        salePrice: product.salePrice ? String(product.salePrice) : "",
        stock: String(product.stock),
        unit: product.unit,
        weight: product.weight ? String(product.weight) : "",
        status: product.status as FormState["status"],
      });
    }
  }, [product, mode]);

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim() || form.name.length < 3) e.name = "Tên phải có ít nhất 3 ký tự";
    if (!form.categoryId) e.categoryId = "Vui lòng chọn danh mục";
    if (!form.price || parseFloat(form.price) <= 0) e.price = "Giá phải lớn hơn 0";
    if (form.salePrice && parseFloat(form.salePrice) >= parseFloat(form.price)) {
      e.salePrice = "Giá khuyến mãi phải nhỏ hơn giá gốc";
    }
    if (parseInt(form.stock) < 0) e.stock = "Số lượng không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        description: form.description || undefined,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        stock: parseInt(form.stock),
        unit: form.unit,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        status: form.status,
      };

      let productId = product?.id;

      if (mode === "create") {
        const res = await productsService.createProduct(payload);
        productId = res.data.id;

        // Upload ảnh nếu có
        if (images.length > 0) {
          await productsService.addProductImages(productId!, images);
        }
      } else if (productId) {
        await productsService.updateProduct(productId, payload);
      }

      router.push("/vendor/products");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim() || !/^https?:\/\/.+/.test(newImageUrl)) return;
    setImages((prev) => [
      ...prev,
      { url: newImageUrl.trim(), isPrimary: prev.length === 0, sortOrder: prev.length },
    ]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Nếu xóa ảnh primary thì set ảnh đầu tiên còn lại làm primary
      if (prev[index].isPrimary && next.length > 0) next[0].isPrimary = true;
      return next;
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  const title = mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm";

  return (
    <VendorLayout title={title}>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
        {serverError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <span>⚠️</span>
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">
            Thông tin cơ bản
          </h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Gừng khô nguyên chất 100g"
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: undefined })); }}
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.name ? "border-red-400" : "border-slate-200"}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => { setForm((p) => ({ ...p, categoryId: e.target.value })); setErrors((p) => ({ ...p, categoryId: undefined })); }}
              className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${errors.categoryId ? "border-red-400" : "border-slate-200"}`}
            >
              <option value="">— Chọn danh mục —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `   └ ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả sản phẩm</label>
            <textarea
              placeholder="Mô tả chi tiết về sản phẩm, công dụng, cách dùng..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">
            Giá & Tồn kho
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Giá gốc (đ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={(e) => { setForm((p) => ({ ...p, price: e.target.value })); setErrors((p) => ({ ...p, price: undefined })); }}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.price ? "border-red-400" : "border-slate-200"}`}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            {/* Sale price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Giá khuyến mãi (đ)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Để trống nếu không khuyến mãi"
                value={form.salePrice}
                onChange={(e) => { setForm((p) => ({ ...p, salePrice: e.target.value })); setErrors((p) => ({ ...p, salePrice: undefined })); }}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.salePrice ? "border-red-400" : "border-slate-200"}`}
              />
              {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Số lượng tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => { setForm((p) => ({ ...p, stock: e.target.value })); setErrors((p) => ({ ...p, stock: undefined })); }}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.stock ? "border-red-400" : "border-slate-200"}`}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Đơn vị</label>
              <input
                type="text"
                placeholder="gói, hộp, chai, kg..."
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Khối lượng (gram)</label>
              <input
                type="number"
                min="0"
                placeholder="VD: 100"
                value={form.weight}
                onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FormState["status"] }))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="draft">Nháp — chưa hiển thị</option>
                <option value="active">Đang bán — hiển thị ngay</option>
                <option value="inactive">Ẩn — tạm ngưng bán</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images — chỉ hiện khi tạo mới */}
        {mode === "create" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">
              Hình ảnh sản phẩm
            </h2>

            {/* Add image */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Nhập URL hình ảnh..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Thêm
              </button>
            </div>
            <p className="text-xs text-slate-400">Hỗ trợ URL ảnh từ internet. Ảnh đầu tiên sẽ là ảnh chính.</p>

            {/* Image list */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${img.isPrimary ? "border-emerald-500" : "border-slate-200"}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "")} />
                    </div>
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                        Chính
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimary(i)}
                          className="px-2 py-1 bg-emerald-600 text-white text-[10px] rounded-lg"
                        >
                          Đặt chính
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="px-2 py-1 bg-red-500 text-white text-[10px] rounded-lg"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={() => router.push("/vendor/products")}
            className="flex-1 py-3 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </VendorLayout>
  );
}
