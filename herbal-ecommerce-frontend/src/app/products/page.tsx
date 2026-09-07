"use client";
// src/app/products/page.tsx

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { ProductCard } from "../../components/product/ProductCard";
import {
  productsService,
  Product,
  ProductsQuery,
} from "../../services/products.service";
import { categoriesService, Category } from "../../services/categories.service";
import { getErrorMessage } from "../../utils/error";

const SORT_OPTIONS: {
  label: string;
  sortBy: ProductsQuery["sortBy"];
  sortOrder: "asc" | "desc";
}[] = [
  { label: "Mới nhất", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Bán chạy", sortBy: "soldCount", sortOrder: "desc" },
  { label: "Xem nhiều", sortBy: "viewCount", sortOrder: "desc" },
  { label: "Giá tăng dần", sortBy: "price", sortOrder: "asc" },
  { label: "Giá giảm dần", sortBy: "price", sortOrder: "desc" },
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state — khởi tạo từ URL query
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || "",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortIndex, setSortIndex] = useState(() => {
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const idx = SORT_OPTIONS.findIndex(
      (o) => o.sortBy === sortBy && o.sortOrder === sortOrder,
    );
    return idx >= 0 ? idx : 0;
  });
  const page = parseInt(searchParams.get("page") || "1");

  // Load danh mục 1 lần
  useEffect(() => {
    categoriesService
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const sort = SORT_OPTIONS[sortIndex];
      const res = await productsService.getProducts({
        page,
        limit: 12,
        search: search || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      });
      setProducts(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryId, minPrice, maxPrice, sortIndex]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Đồng bộ filter lên URL (giữ nguyên UX có thể back/forward, share link)
  const updateUrl = (params: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    next.delete("page"); // reset về trang 1 khi đổi filter
    router.push(`/products?${next.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search });
  };

  const handleCategoryClick = (id: string) => {
    const next = categoryId === id ? "" : id;
    setCategoryId(next);
    updateUrl({ categoryId: next });
  };

  const handlePriceFilter = () => {
    updateUrl({ minPrice, maxPrice });
  };

  const handleSortChange = (idx: number) => {
    setSortIndex(idx);
    const sort = SORT_OPTIONS[idx];
    updateUrl({ sortBy: sort.sortBy, sortOrder: sort.sortOrder });
  };

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(p));
    router.push(`/products?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {search ? `Kết quả cho "${search}"` : "Tất cả sản phẩm"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar filter */}
          <aside className="space-y-5">
            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white border border-gray-100 rounded-2xl p-4"
            >
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm
              </p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên sản phẩm..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </form>

            {/* Category filter */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Danh mục
              </p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      categoryId === cat.id
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat._count && (
                      <span className="text-xs text-gray-400">
                        {cat._count.products}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Khoảng giá
              </p>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Từ"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-300">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Đến"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={handlePriceFilter}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </aside>

          {/* Product grid */}
          <div className="lg:col-span-3">
            {/* Sort bar */}
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-5">
              <p className="text-sm text-gray-500">
                {isLoading ? "Đang tải..." : `${meta.total} sản phẩm`}
              </p>
              <select
                value={sortIndex}
                onChange={(e) => handleSortChange(Number(e.target.value))}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={opt.label} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-white border border-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      ← Trước
                    </button>
                    {Array.from(
                      { length: meta.totalPages },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                          p === page
                            ? "bg-emerald-600 text-white font-medium"
                            : "border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={page >= meta.totalPages}
                      onClick={() => goToPage(page + 1)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
