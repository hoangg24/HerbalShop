"use client";
// src/app/forgot-password/page.tsx

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/auth.service";
import {getErrorMessage}   from "../../utils/error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (err: unknown) {
     setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthLayout
        title="Kiểm tra email"
        subtitle="Chúng tôi đã gửi hướng dẫn cho bạn"
      >
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Nếu email <span className="font-medium text-gray-900">{email}</span>{" "}
            tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật
            khẩu trong vài phút.
          </p>
          <p className="text-xs text-gray-400">
            Link có hiệu lực trong 15 phút.
          </p>
          <Link href="/login">
            <Button variant="outline" fullWidth>
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận hướng dẫn đặt lại mật khẩu"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
          required
          leftIcon={
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
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Gửi hướng dẫn
        </Button>

        <Link href="/login">
          <Button variant="ghost" fullWidth>
            ← Quay lại đăng nhập
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
