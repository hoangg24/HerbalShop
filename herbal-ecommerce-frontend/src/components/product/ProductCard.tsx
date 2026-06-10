// src/components/product/ProductCard.tsx
import Link from "next/link";
import { Product } from "../../services/products.service";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-emerald-100/50 hover:border-emerald-200 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                -{discountPercent}%
              </span>
            )}
            {product.soldCount > 100 && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                Hot 🔥
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                Hết hàng
              </span>
            )}
          </div>

          {/* Quick add to cart */}
          <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-xs font-medium py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            + Thêm vào giỏ hàng
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          {/* Category */}
          <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide mb-1">
            {product.category.name}
          </p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-base font-bold text-emerald-700">
              {formatPrice(product.salePrice ?? product.price)}
            </span>
            {product.salePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-[10px] text-gray-400 ml-auto">/{product.unit}</span>
          </div>

          {/* Shop + stats */}
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span className="truncate">{product.vendor.shopName}</span>
            <span>⭐ {product._count.reviews} đánh giá</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
