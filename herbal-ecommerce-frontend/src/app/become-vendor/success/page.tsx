"use client";
// src/app/become-vendor/success/page.tsx

import Link from "next/link";

export default function BecomeVendorSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100/50 p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Đăng ký thành công! 🎉
        </h1>
        <p className="text-slate-500 text-sm mb-2">
          Shop của bạn đã được gửi đi và đang chờ admin xét duyệt.
        </p>
        <p className="text-slate-400 text-xs mb-8">
          Thời gian xét duyệt thông thường trong vòng <strong>24 giờ</strong>. Chúng tôi sẽ thông báo qua email khi có kết quả.
        </p>

        {/* Steps */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3">
          {[
            { icon: "✅", text: "Đã gửi thông tin shop" },
            { icon: "⏳", text: "Admin đang xét duyệt" },
            { icon: "🚀", text: "Bắt đầu đăng sản phẩm" },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{icon}</span>
              <span className={i === 2 ? "text-slate-400" : "text-slate-700"}>{text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/vendor/dashboard">
            <button className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Xem trạng thái shop
            </button>
          </Link>
          <Link href="/">
            <button className="w-full py-2.5 text-slate-500 text-sm hover:text-slate-700 transition-colors">
              Về trang chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
