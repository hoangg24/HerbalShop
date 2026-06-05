"use client";
// src/components/ui/Input.tsx

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {/* Label - Thay đổi tone màu chữ nhẹ nhàng hơn */}
        {label && (
          <label className="block text-sm font-semibold text-emerald-950 mb-1.5 select-none">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative group">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200">
              {leftIcon}
            </div>
          )}

          {/* Input chính - Được thiết kế lại thanh thoát hơn */}
          <input
            ref={ref}
            className={cn(
              // Layout & Typography
              "w-full bg-white px-4 py-2.5 text-sm text-gray-800 transition-all duration-200 outline-none",
              // Thay đổi: Bo góc mặc định là rounded-xl cho đồng bộ style thảo mộc mềm mại
              "rounded-xl border",
              // Trạng thái Placeholder
              "placeholder:text-gray-400 placeholder:font-light",
              // Thay đổi: Hiệu ứng Focus viền emerald mượt và đổ bóng nhạt (Glow ring) thay vì ring-2 đậm cứng
              "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/70",
              // Trạng thái Disabled
              "disabled:bg-gray-50/80 disabled:text-gray-400 disabled:cursor-not-allowed",
              // Căn chỉnh khoảng cách chữ khi có Icon
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              // Xử lý trạng thái Lỗi dữ liệu
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-50"
                : "border-gray-200 hover:border-gray-300",
              // Class linh hoạt nhận từ ngoài vào để đè hoặc thêm style dễ dàng
              className,
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Thông báo lỗi lỗi nhập liệu bên dưới */}
        {error && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium px-0.5 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
