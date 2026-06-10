// src/components/layout/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-emerald-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🌿</span>
              </div>
              <span className="font-bold text-lg">Herbal Shop</span>
            </div>
            <p className="text-emerald-300 text-sm leading-relaxed">
              Nơi cung cấp các sản phẩm thảo mộc tự nhiên chất lượng cao từ khắp nơi trên Việt Nam.
            </p>
            <div className="flex gap-3 mt-4">
              {["Facebook", "Instagram", "Youtube"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 bg-emerald-800 hover:bg-emerald-700 rounded-lg flex items-center justify-center text-xs transition-colors">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Mua sắm",
              links: [
                { label: "Tất cả sản phẩm", href: "/products" },
                { label: "Bán chạy", href: "/products?sortBy=soldCount" },
                { label: "Sản phẩm mới", href: "/products?sortBy=createdAt" },
                { label: "Khuyến mãi", href: "/products?sale=true" },
              ],
            },
            {
              title: "Hỗ trợ",
              links: [
                { label: "Hướng dẫn mua hàng", href: "/guide" },
                { label: "Chính sách đổi trả", href: "/returns" },
                { label: "Chính sách bảo mật", href: "/privacy" },
                { label: "Liên hệ", href: "/contact" },
              ],
            },
            {
              title: "Nhà cung cấp",
              links: [
                { label: "Đăng ký bán hàng", href: "/become-vendor" },
                { label: "Quản lý shop", href: "/vendor/dashboard" },
                { label: "Chính sách vendor", href: "/vendor-policy" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-emerald-300 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-emerald-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-emerald-400 text-xs">© 2025 Herbal Shop. All rights reserved.</p>
          <p className="text-emerald-400 text-xs">Hotline: 0901 234 567 | Email: support@herbalshop.vn</p>
        </div>
      </div>
    </footer>
  );
}
