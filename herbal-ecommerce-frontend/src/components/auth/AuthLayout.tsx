// src/components/auth/AuthLayout.tsx

import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7f2] via-white to-[#edf3ec] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background decorations - Đốm màu sinh thái lớn và mềm mại hơn */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-20 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo - Hiệu ứng tương tác mượt mà đúng chất Organic */}
        <Link
          href="/"
          className="group flex flex-col items-center justify-center gap-3 mb-8 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200/60 transform group-hover:rotate-12 transition-transform duration-300 ease-out">
            <span className="text-white text-2xl">🌿</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
              Herbal Shop
            </span>
            <p className="text-[10px] uppercase tracking-widest text-emerald-600/70 font-medium">
              Natural Products
            </p>
          </div>
        </Link>

        {/* Card - Trắng ngà nhẹ gộp Glassmorphism cao cấp */}
        <div className="bg-white/90 backdrop-blur-md rounded-[24px] shadow-2xl shadow-emerald-900/[0.04] border border-white/60 p-8 md:p-9 transition-all duration-300">
          {/* Header trong Card - Đổi màu chữ sang tone xanh rêu tự nhiên */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-500/90 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form nội dung */}
          {children}
        </div>
      </div>
    </div>
  );
}
