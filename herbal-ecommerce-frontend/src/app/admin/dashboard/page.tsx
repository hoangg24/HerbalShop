'use client'
// src/app/admin/dashboard/page.tsx

import { AdminLayout } from '../../../components/admin/AdminLayout'
import Link from 'next/link'

const stats = [
  { label: 'Tổng người dùng', value: '—', change: '', icon: '👥', color: 'blue', href: '/admin/users' },
  { label: 'Nhà cung cấp', value: '—', change: '', icon: '🏪', color: 'purple', href: '/admin/vendors' },
  { label: 'Sản phẩm', value: '—', change: '', icon: '🌿', color: 'emerald', href: '/admin/products' },
  { label: 'Đơn hàng hôm nay', value: '—', change: '', icon: '📦', color: 'amber', href: '/admin/orders' },
]

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
}

const quickLinks = [
  { label: 'Quản lý người dùng', desc: 'Xem, khoá, đổi role', href: '/admin/users', icon: '👥' },
  { label: 'Duyệt nhà cung cấp', desc: 'Xem danh sách chờ duyệt', href: '/admin/vendors', icon: '🏪' },
  { label: 'Quản lý sản phẩm', desc: 'Duyệt, ẩn sản phẩm', href: '/admin/products', icon: '🌿' },
  { label: 'Quản lý đơn hàng', desc: 'Theo dõi trạng thái đơn', href: '/admin/orders', icon: '📦' },
]

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-blue-600/20">
        <h2 className="text-xl font-bold mb-1">Chào mừng trở lại! 👋</h2>
        <p className="text-blue-100 text-sm">Đây là tổng quan hoạt động của Herbal Shop hôm nay.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl mb-3 ${colorMap[stat.color]}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Truy cập nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group">
                <span className="text-2xl">{link.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{link.label}</p>
                  <p className="text-xs text-slate-400">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
