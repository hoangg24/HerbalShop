"use client";
// src/app/products/[slug]/page.tsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { productsService, Product } from "../../../services/products.service";
import { getErrorMessage } from "../../../utils/error";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string };
}

interface ProductDetail extends Product {
  reviews?: Review[];
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Image gallery
  const [activeImage, setActiveImage] = useState(0);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Tab
  const [tab, setTab] = useState<"desc" | "reviews">("desc");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productsService.getProductBySlug(slug);
        setProduct(res.data);
        // Set primary image as default
        const primaryIdx = (res.data.images || []).findIndex(
          (img: { isPrimary: boolean }) => img.isPrimary,
        );
        setActiveImage(primaryIdx >= 0 ? primaryIdx : 0);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetch();
  }, [slug]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const discountPercent = product?.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const avgRating = product?.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded-xl animate-pulse w-3/4" />
              <div className="h-6 bg-gray-100 rounded-xl animate-pulse w-1/3" />
              <div className="h-4 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-4 bg-gray-100 rounded-xl animate-pulse w-5/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <span className="text-5xl block mb-4">😕</span>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Không tìm thấy sản phẩm
          </p>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <Link href="/products">
            <button className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors">
              Quay lại danh sách
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[activeImage];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Trang chủ
          </Link>
          <span>›</span>
          <Link
            href="/products"
            className="hover:text-emerald-600 transition-colors"
          >
            Sản phẩm
          </Link>
          <span>›</span>
          <Link
            href={`/products?categoryId=${product.category.id}`}
            className="hover:text-emerald-600 transition-colors"
          >
            {product.category.name}
          </Link>
          <span>›</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Image gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.altText || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-emerald-50">
                  🌿
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImage
                        ? "border-emerald-500 shadow-md"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            {/* Category + vendor */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/products?categoryId=${product.category.id}`}>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors">
                  {product.category.name}
                </span>
              </Link>
              <Link href={`/shop/${product.vendor.slug}`}>
                <span className="text-xs text-gray-500 hover:text-emerald-600 transition-colors">
                  🏪 {product.vendor.shopName}
                </span>
              </Link>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            {product._count.reviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= Math.round(avgRating) ? "text-amber-400" : "text-gray-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} ({product._count.reviews} đánh giá)
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">
                  Đã bán {product.soldCount}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-700">
                  {formatPrice(product.salePrice ?? product.price)}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-lg">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                Giá đã bao gồm VAT · /{product.unit}
              </p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-sm text-emerald-700 font-medium">
                    Còn hàng ({product.stock} {product.unit})
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-600 font-medium">
                    Hết hàng
                  </span>
                </>
              )}
              {product.weight && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">
                    Khối lượng: {product.weight}g
                  </span>
                </>
              )}
            </div>

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Số lượng:
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    Tối đa {product.stock} {product.unit}
                  </span>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 pt-2">
              <button
                disabled={product.stock === 0}
                className="flex-1 py-3.5 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                🛒 Thêm vào giỏ
              </button>
              <button
                disabled={product.stock === 0}
                className="flex-1 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-emerald-600/20 text-sm"
              >
                ⚡ Mua ngay
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[
                { icon: "✅", text: "Hàng chính hãng" },
                { icon: "🚚", text: "Miễn phí ship từ 299k" },
                { icon: "🔄", text: "Đổi trả 7 ngày" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[10px] text-gray-500 leading-tight">
                    {b.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Mô tả & Đánh giá */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          {/* Tab headers */}
          <div className="flex border-b border-gray-100">
            {[
              { key: "desc", label: "Mô tả sản phẩm" },
              { key: "reviews", label: `Đánh giá (${product._count.reviews})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "desc" | "reviews")}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {tab === "desc" ? (
              product.description ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <span className="text-3xl block mb-2">📄</span>
                  <p className="text-sm">Chưa có mô tả sản phẩm</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  <>
                    {/* Rating summary */}
                    <div className="flex items-center gap-6 pb-4 border-b border-gray-100">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-emerald-700">
                          {avgRating.toFixed(1)}
                        </p>
                        <div className="flex justify-center mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`text-lg ${s <= Math.round(avgRating) ? "text-amber-400" : "text-gray-200"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {product._count.reviews} đánh giá
                        </p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = product.reviews!.filter(
                            (r) => r.rating === star,
                          ).length;
                          const pct = product.reviews!.length
                            ? (count / product.reviews!.length) * 100
                            : 0;
                          return (
                            <div
                              key={star}
                              className="flex items-center gap-2 text-xs text-gray-500"
                            >
                              <span className="w-4">{star}★</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-6 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews list */}
                    {product.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex gap-3 pb-4 border-b border-gray-50 last:border-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                          {review.user.avatar ? (
                            <img
                              src={review.user.avatar}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            review.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              {review.user.name}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                  key={s}
                                  className={`text-sm ${s <= review.rating ? "text-amber-400" : "text-gray-200"}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400 ml-auto">
                              {new Date(review.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-3xl block mb-2">⭐</span>
                    <p className="text-sm">Chưa có đánh giá nào</p>
                    <p className="text-xs mt-1">
                      Hãy là người đầu tiên đánh giá sản phẩm này
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vendor info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl flex-shrink-0">
              {product.vendor.logoUrl ? (
                <img
                  src={product.vendor.logoUrl}
                  alt=""
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                "🏪"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800">
                {product.vendor.shopName}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Nhà cung cấp chính hãng
              </p>
            </div>
            <Link href={`/shop/${product.vendor.slug}`}>
              <button className="px-4 py-2 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors">
                Xem shop →
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
