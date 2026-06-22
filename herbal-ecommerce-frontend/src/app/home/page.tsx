"use client";
// src/app/page.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { HeroBanner } from "../../components/home/HeroBanner";
import { ProductCard } from "../../components/product/ProductCard";
import { productsService, Product } from "../../services/products.service";
import { categoriesService, Category } from "../../services/categories.service";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catsRes, newRes, hotRes] = await Promise.all([
          categoriesService.getCategories(),
          productsService.getProducts({
            limit: 8,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
          productsService.getProducts({
            limit: 8,
            sortBy: "soldCount",
            sortOrder: "desc",
          }),
        ]);
        setCategories(catsRes.data || []);
        setNewProducts(newRes.data || []);
        setHotProducts(hotRes.data || []);
      } catch {
        // Không show lỗi ở trang chủ, dùng empty state
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        <HeroBanner />

        {/* Features bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: "🚚",
              title: "Miễn phí vận chuyển",
              desc: "Đơn từ 299.000đ",
            },
            { icon: "✅", title: "Hàng chính hãng", desc: "100% tự nhiên" },
            { icon: "🔄", title: "Đổi trả dễ dàng", desc: "Trong vòng 7 ngày" },
            { icon: "💬", title: "Hỗ trợ 24/7", desc: "Tư vấn miễn phí" },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 shadow-sm"
            >
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{f.title}</p>
                <p className="text-[10px] text-gray-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Danh mục sản phẩm
              </h2>
              <p className="text-sm text-gray-400">
                Khám phá theo từng loại thảo mộc
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            // ✅ Empty state thật, bỏ hardcode giả
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <span className="text-4xl block mb-3">🌿</span>
              <p className="text-gray-500 text-sm">Chưa có danh mục nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={`/products?categoryId=${cat.id}`}>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all group">
                    {cat.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-10 h-10 object-cover rounded-xl group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <span className="text-3xl group-hover:scale-110 transition-transform">
                        🌿
                      </span>
                    )}
                    <p className="text-xs font-medium text-gray-700 text-center leading-tight">
                      {cat.name}
                    </p>
                    {cat._count && (
                      <p className="text-[10px] text-gray-400">
                        {cat._count.products} sp
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Hot products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Bán chạy nhất 🔥
              </h2>
              <p className="text-sm text-gray-400">
                Được yêu thích bởi hàng nghìn khách hàng
              </p>
            </div>
            <Link
              href="/products?sortBy=soldCount"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                >
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <span className="text-4xl block mb-3">🌿</span>
              <p className="text-gray-500 text-sm">Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* New products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Sản phẩm mới ✨
              </h2>
              <p className="text-sm text-gray-400">
                Vừa được thêm vào cửa hàng
              </p>
            </div>
            <Link
              href="/products?sortBy=createdAt"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                >
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : newProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <span className="text-4xl block mb-3">🌱</span>
              <p className="text-gray-500 text-sm">Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Become vendor CTA */}
        <section className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl p-8 text-center text-white">
          <span className="text-4xl block mb-3">🏪</span>
          <h2 className="text-2xl font-bold mb-2">
            Bạn muốn bán hàng trên Herbal Shop?
          </h2>
          <p className="text-emerald-100 text-sm mb-6 max-w-md mx-auto">
            Đăng ký trở thành nhà cung cấp ngay hôm nay. Miễn phí, dễ dàng và
            tiếp cận hàng nghìn khách hàng.
          </p>
          <Link href="/become-vendor">
            <button className="px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
              Đăng ký bán hàng →
            </button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
