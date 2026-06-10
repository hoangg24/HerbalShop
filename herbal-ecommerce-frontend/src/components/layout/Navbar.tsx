"use client";
// src/components/layout/Navbar.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-emerald-700 text-white text-xs py-1.5 text-center">
        🌿 Miễn phí vận chuyển cho đơn hàng từ 299.000đ &nbsp;|&nbsp; Hotline:
        0856694757
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-lg">🌿</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-emerald-800 text-base leading-tight">
                Herbal Shop
              </p>
              <p className="text-emerald-600 text-[10px] leading-tight">
                Thiên nhiên & Sức khỏe
              </p>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm thảo mộc, tinh dầu, trà thảo mộc..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition-colors"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex flex-col items-center p-2 hover:bg-emerald-50 rounded-xl transition-colors group"
            >
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
              <span className="text-[10px] text-gray-500 group-hover:text-emerald-600 hidden sm:block">
                Giỏ hàng
              </span>
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex flex-col items-center p-2 hover:bg-emerald-50 rounded-xl transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-gray-500 group-hover:text-emerald-600 hidden sm:block mt-0.5">
                    {user?.name?.split(" ").pop()}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      {[
                        {
                          label: "Tài khoản của tôi",
                          href: "/account/profile",
                          icon: "👤",
                        },
                        {
                          label: "Đơn hàng của tôi",
                          href: "/account/orders",
                          icon: "📦",
                        },
                        {
                          label: "Địa chỉ giao hàng",
                          href: "/account/addresses",
                          icon: "📍",
                        },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50 text-sm text-gray-700 hover:text-emerald-700 transition-colors">
                            <span>{item.icon}</span>
                            {item.label}
                          </div>
                        </Link>
                      ))}

                      {/* Vendor dashboard */}
                      {(user?.role === "vendor" || user?.role === "admin") && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          {user.role === "vendor" && (
                            <Link
                              href="/vendor/dashboard"
                              onClick={() => setMenuOpen(false)}
                            >
                              <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-blue-50 text-sm text-blue-600 transition-colors">
                                <span>🏪</span>Quản lý shop
                              </div>
                            </Link>
                          )}
                          {user.role === "admin" && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setMenuOpen(false)}
                            >
                              <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 text-sm text-purple-600 transition-colors">
                                <span>⚙️</span>Admin Panel
                              </div>
                            </Link>
                          )}
                        </>
                      )}

                      {/* Become vendor */}
                      {user?.role === "buyer" && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          <Link
                            href="/become-vendor"
                            onClick={() => setMenuOpen(false)}
                          >
                            <div className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50 text-sm text-emerald-600 transition-colors">
                              <span>🌱</span>Trở thành nhà cung cấp
                            </div>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 text-sm text-red-500 transition-colors"
                        >
                          <span>🚪</span>Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="flex flex-col items-center p-2 hover:bg-emerald-50 rounded-xl transition-colors group">
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-[10px] text-gray-500 group-hover:text-emerald-600 hidden sm:block">
                    Đăng nhập
                  </span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Category nav */}
        <nav className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {[
            { label: "Tất cả", href: "/products" },
            {
              label: "Thảo mộc khô",
              href: "/products?categorySlug=thao-moc-kho",
            },
            { label: "Tinh dầu", href: "/products?categorySlug=tinh-dau" },
            {
              label: "Trà thảo mộc",
              href: "/products?categorySlug=tra-thao-moc",
            },
            {
              label: "Bột thảo mộc",
              href: "/products?categorySlug=bot-thao-moc",
            },
            {
              label: "Chăm sóc da",
              href: "/products?categorySlug=cham-soc-da",
            },
            { label: "Bán chạy", href: "/products?sortBy=soldCount" },
            { label: "Mới nhất", href: "/products?sortBy=createdAt" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
