"use client";
// src/app/vendor/products/edit/[id]/page.tsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "../../../../../components/vendor/ProductForm";
import { productsService, Product } from "../../../../../services/products.service";
import { VendorLayout } from "../../../../../components/vendor/VendorLayout";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Lấy danh sách sp của mình rồi tìm theo id
    productsService.getMyProducts({ limit: 100 })
      .then((res) => {
        const found = (res.data || []).find((p: Product) => p.id === id);
        if (found) setProduct(found);
        else setError("Không tìm thấy sản phẩm");
      })
      .catch(() => setError("Không thể tải sản phẩm"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <VendorLayout title="Chỉnh sửa sản phẩm">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </VendorLayout>
    );
  }

  if (error || !product) {
    return (
      <VendorLayout title="Chỉnh sửa sản phẩm">
        <div className="text-center py-20">
          <span className="text-4xl block mb-3">😕</span>
          <p className="text-slate-500">{error || "Không tìm thấy sản phẩm"}</p>
        </div>
      </VendorLayout>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
