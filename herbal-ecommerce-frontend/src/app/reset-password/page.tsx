"use client";
// src/app/reset-password/page.tsx

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/auth.service";
import { getErrorMessage } from "../../utils/error";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-500">
          Link không hợp lệ hoặc đã hết hạn.
        </p>
        <Link href="/forgot-password">
          <Button variant="outline" fullWidth>
            Yêu cầu link mới
          </Button>
        </Link>
      </div>
    );
  }

  const validate = () => {
    const e: typeof errors = {};
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 8)
      e.password = "Mật khẩu phải có ít nhất 8 ký tự";
    else if (!/[A-Z]/.test(form.password))
      e.password = "Phải có ít nhất 1 chữ hoa";
    else if (!/[0-9]/.test(form.password))
      e.password = "Phải có ít nhất 1 chữ số";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerError("");
    try {
      setIsLoading(true);
      await authService.resetPassword({ token, password: form.password });
      setIsDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600">
          Mật khẩu đã được đặt lại thành công!
        </p>
        <p className="text-xs text-gray-400">
          Đang chuyển về trang đăng nhập...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      <Input
        label="Mật khẩu mới"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => {
          setForm((p) => ({ ...p, password: e.target.value }));
          setErrors((p) => ({ ...p, password: undefined }));
        }}
        error={errors.password}
        required
      />

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="••••••••"
        value={form.confirmPassword}
        onChange={(e) => {
          setForm((p) => ({ ...p, confirmPassword: e.target.value }));
          setErrors((p) => ({ ...p, confirmPassword: undefined }));
        }}
        error={errors.confirmPassword}
        required
      />

      <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
        Đặt lại mật khẩu
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới của bạn">
      <Suspense
        fallback={
          <div className="text-center text-sm text-gray-400">Đang tải...</div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
