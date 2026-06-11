"use client";
// src/app/login/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [error, setError] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!form.email) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Email không hợp lệ";
    if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu";
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError("");

    try {
      setIsLoading(true); // Đảm bảo bật trạng thái loading khi bấm submit
      await login(form.email, form.password);
      const role = JSON.parse(
        atob(localStorage.getItem("hs_access_token")!.split(".")[1]),
      ).role;
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "vendor") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/home");
      }
    } catch (err) {
      const message = getErrorMessage(err);
      if (
        message.toLowerCase().includes("khóa") ||
        message.toLowerCase().includes("khoá") ||
        message.toLowerCase().includes("inactive") ||
        message.toLowerCase().includes("active")
      ) {
        setServerError(
          "Tài khoản của bạn đã bị khoá bởi Admin. Vui lòng liên hệ 0856694757 để được mở khoá.",
        );
      } else {
        setServerError(message);
      }
    }
  };

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error[field]) setError((prev) => ({ ...prev, [field]: undefined }));
    };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay trở lại 👋">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Thông báo lỗi từ Server */}
        {serverError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl animate-fade-in">
            <span className="text-red-500 text-sm mt-0.5">⚠️</span>
            <p className="text-sm font-medium text-red-700 leading-relaxed">
              {serverError}
            </p>
          </div>
        )}

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={handleChange("email")}
          error={error.email}
          required
          autoComplete="email"
          className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
        />

        {/* Mật khẩu */}
        <div className="space-y-2">
          <Input
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange("password")}
            error={error.password}
            required
            autoComplete="current-password"
            className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-emerald-600 transition-colors duration-200 focus:outline-none p-1"
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            }
          />

          {/* Quên mật khẩu */}
          <div className="flex justify-end px-0.5">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-150 hover:underline underline-offset-2"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {/* Nút Đăng nhập */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl shadow-sm shadow-emerald-100 transition-all duration-200 hover:shadow-md transform active:scale-[0.99]"
        >
          Đăng nhập
        </Button>

        {/* Đường gạch ngang "Hoặc" - Được làm mờ nhẹ tự nhiên hơn */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white px-3 text-gray-400 font-light">hoặc</span>
          </div>
        </div>

        {/* Link Điều hướng chuyển sang Đăng ký */}
        <p className="text-center text-sm text-gray-500 pt-1">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-150 underline decoration-emerald-200 hover:decoration-emerald-500 underline-offset-4"
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
