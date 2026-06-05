"use client";
// src/components/ui/Button.tsx

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  // Thay đổi: Đổi mặc định từ rounded-lg thành rounded-xl để nút bấm trông mềm mại, tự nhiên hơn
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

  // Thay đổi: Thêm shadow dịu nhẹ tone thảo mộc cho nút Primary, làm mềm các viền Outline
  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-sm shadow-emerald-100 hover:shadow-md hover:shadow-emerald-200/50",
    outline:
      "border border-emerald-600 text-emerald-600 hover:bg-emerald-50/50 focus:ring-emerald-500 active:bg-emerald-100/50",
    ghost: "text-emerald-800 hover:bg-emerald-50/60 focus:ring-emerald-400",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm", // Tăng nhẹ padding ngang để nút bấm cân đối, thoáng đãng hơn
    lg: "px-7 py-3 text-base tracking-wide",
  };

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className, // Nhận toàn bộ class tùy biến từ bên ngoài truyền vào
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          {/* Spinner quay mượt mà hơn */}
          <svg
            className="animate-spin h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="opacity-90">Đang xử lý...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
