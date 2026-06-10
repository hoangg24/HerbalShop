"use client";
// src/app/vendor/dashboard/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { vendorsService } from "../../../services/vendors.service";
import { getErrorMessage } from "../../../utils/error";

interface Vendor {
  id: string;
  shopName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  status: "pending" | "active" | "suspended";
  commissionRate: number;
  bankAccount?: string;
  bankName?: string;
  createdAt: string;
  _count?: { products: number };
}

const STATUS_CONFIG = {
  pending: {
    label: "Chờ duyệt",
    class: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "⏳",
    desc: "Shop của bạn đang chờ admin xét duyệt.",
  },
  active: {
    label: "Đang hoạt động",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "✅",
    desc: "Shop của bạn đang hoạt động bình thường.",
  },
  suspended: {
    label: "Tạm ngưng",
    class: "bg-red-50 text-red-700 border-red-200",
    icon: "🔒",
    desc: "Shop của bạn đã bị tạm ngưng. Vui lòng liên hệ admin.",
  },
};

export default function VendorDashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vendorsService.getMyVendor();
        setVendor(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsFetching(false);
      }
    };
    if (isAuthenticated) fetch();
  }, [isAuthenticated]);

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Chưa có shop
  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
          <span className="text-5xl block mb-4">🏪</span>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Bạn chưa có shop</h2>
          <p className="text-slate-500 text-sm mb-6">
            Đăng ký để trở thành nhà cung cấp và bắt đầu bán hàng trên Herbal Shop.
          </p>
          <Link href="/become-vendor">
            <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Đăng ký shop ngay
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[vendor.status];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🌿</span>
            </div>
            <span className="font-bold text-slate-800">Herbal Shop</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-500">Vendor Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user?.name}</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Status banner */}
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${status.class}`}>
          <span className="text-2xl">{status.icon}</span>
          <div>
            <p className="font-semibold">{status.label}</p>
            <p className="text-sm opacity-80">{status.desc}</p>
          </div>
        </div>

        {/* Shop info card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl">
                🏪
              </div>
            </div>
          </div>

          <div className="pt-12 px-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{vendor.shopName}</h1>
                <p className="text-sm text-slate-500">@{vendor.slug}</p>
              </div>
              {vendor.status === "active" && (
                <Link href="/vendor/shop">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                    Chỉnh sửa shop
                  </button>
                </Link>
              )}
            </div>
            {vendor.description && (
              <p className="text-sm text-slate-600 mt-3">{vendor.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Sản phẩm", value: vendor._count?.products ?? 0, icon: "📦" },
            { label: "Hoa hồng", value: `${vendor.commissionRate}%`, icon: "💰" },
            {
              label: "Ngày đăng ký",
              value: new Date(vendor.createdAt).toLocaleDateString("vi-VN"),
              icon: "📅",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-2xl block mb-2">{stat.icon}</span>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bank info */}
        {(vendor.bankAccount || vendor.bankName) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">💳 Tài khoản ngân hàng</h3>
            <div className="space-y-2">
              {vendor.bankAccount && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số tài khoản</span>
                  <span className="font-medium text-slate-800">{vendor.bankAccount}</span>
                </div>
              )}
              {vendor.bankName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ngân hàng</span>
                  <span className="font-medium text-slate-800">{vendor.bankName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active vendor actions */}
        {vendor.status === "active" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">⚡ Truy cập nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Quản lý sản phẩm", icon: "📦", href: "/vendor/products" },
                { label: "Đơn hàng", icon: "🛒", href: "/vendor/orders" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
