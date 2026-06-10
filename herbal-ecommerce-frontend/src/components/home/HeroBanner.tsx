"use client";
// src/components/home/HeroBanner.tsx

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const BANNERS = [
  {
    id: 1,
    title: "Thảo mộc tự nhiên",
    subtitle: "100% thiên nhiên từ núi rừng Việt Nam",
    desc: "Giảm đến 30% cho đơn hàng đầu tiên khi đăng ký thành viên",
    cta: "Mua ngay",
    href: "/products",
    badge: "Ưu đãi mới",
    from: "from-emerald-700",
    to: "to-teal-600",
    emoji: "🌿",
  },
  {
    id: 2,
    title: "Tinh dầu nguyên chất",
    subtitle: "Chưng cất lạnh, giữ nguyên dưỡng chất",
    desc: "Miễn phí vận chuyển toàn quốc cho đơn hàng từ 299.000đ",
    cta: "Khám phá ngay",
    href: "/products?categorySlug=tinh-dau",
    badge: "Free ship",
    from: "from-teal-700",
    to: "to-cyan-600",
    emoji: "💧",
  },
  {
    id: 3,
    title: "Trà thảo mộc hữu cơ",
    subtitle: "Tốt cho sức khỏe, thơm ngon tự nhiên",
    desc: "Mua 2 tặng 1 cho toàn bộ dòng trà thảo mộc trong tháng này",
    cta: "Xem ưu đãi",
    href: "/products?categorySlug=tra-thao-moc",
    badge: "Mua 2 tặng 1",
    from: "from-green-700",
    to: "to-emerald-600",
    emoji: "🍃",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 1. Hàm kích hoạt trạng thái hiệu ứng chuyển động (Dùng chung cho cả Next, Prev, và Dot bấm chọn)
  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500); // 500ms này trùng với thời gian chạy transition trong CSS của bạn
  }, []);

  // 2. Hàm goNext (Có chặn bấm liên tục khi đang chạy hiệu ứng)
  const goNext = useCallback(() => {
    if (isAnimating) return; // Nếu đang chạy hiệu ứng chuyển ảnh, chặn không cho bấm tiếp

    triggerAnimation();
    setCurrent((prevCurrent) => (prevCurrent + 1) % BANNERS.length);
  }, [isAnimating, triggerAnimation]); // Cần đưa isAnimating vào đây để hàm nhận diện đúng trạng thái khóa lúc đó

  // 3. Hàm goPrev (Có chặn bấm liên tục khi đang chạy hiệu ứng)
  const goPrev = useCallback(() => {
    if (isAnimating) return; // Nếu đang chạy hiệu ứng chuyển ảnh, chặn không cho bấm tiếp

    triggerAnimation();
    setCurrent(
      (prevCurrent) => (prevCurrent - 1 + BANNERS.length) % BANNERS.length,
    );
  }, [isAnimating, triggerAnimation]);

  // 4. Hàm goTo dành cho các nút chấm tròn (Dots) bên dưới banner
  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;

      triggerAnimation();
      setCurrent(index);
    },
    [isAnimating, triggerAnimation],
  );

  // 5. Bộ đếm thời gian tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      goNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [goNext]); // Nhờ useCallback gác cổng, useEffect chỉ bị reset khi hiệu ứng kết thúc, không ảnh hưởng đến trải nghiệm

  const banner = BANNERS[current];

  return (
    <div
      className={`relative bg-gradient-to-r ${banner.from} ${banner.to} rounded-2xl overflow-hidden transition-all duration-500`}
    >
      {/* Content */}
      <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16 max-w-2xl">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-white/30">
          ✨ {banner.badge}
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
          {banner.title}
        </h1>
        <p className="text-emerald-100 text-base sm:text-lg font-medium mb-3">
          {banner.subtitle}
        </p>
        <p className="text-emerald-200 text-sm mb-6 max-w-md">{banner.desc}</p>

        <div className="flex gap-3">
          <Link href={banner.href}>
            <button className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg shadow-black/10 text-sm">
              {banner.cta} →
            </button>
          </Link>
          <Link href="/products">
            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/30 text-sm">
              Xem tất cả
            </button>
          </Link>
        </div>
      </div>

      {/* Emoji decoration */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] opacity-20 select-none hidden sm:block">
        {banner.emoji}
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

      {/* Prev / Next buttons */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
      >
        ‹
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
