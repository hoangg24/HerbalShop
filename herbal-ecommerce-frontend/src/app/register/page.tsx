"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!form.name.trim() || form.name.length < 2)
      e.name = "Tên phải có ít nhất 2 ký tự";
    if (!form.email) e.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (form.phone && !/^(0|\+84)[0-9]{9}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ";
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
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      router.push("/login");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const getPasswordStrength = () => {
    if (!form.password) return null;
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    if (score <= 1)
      return { label: "Yếu", color: "bg-red-400", width: "w-1/4" };
    if (score === 2)
      return { label: "Trung bình", color: "bg-yellow-400", width: "w-2/4" };
    if (score === 3)
      return { label: "Mạnh", color: "bg-blue-400", width: "w-3/4" };
    return { label: "Rất mạnh", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength();

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Tham gia cộng đồng thảo mộc của chúng tôi 🌿"
    >
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

        {/* Họ và tên */}
        <Input
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          value={form.name}
          onChange={handleChange("name")}
          error={errors.name}
          required
          className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={handleChange("email")}
          error={errors.email}
          required
          className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
        />

        {/* Số điện thoại */}
        <Input
          label="Số điện thoại"
          type="tel"
          placeholder="0901234567"
          value={form.phone}
          onChange={handleChange("phone")}
          error={errors.phone}
          className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
        />

        {/* Mật khẩu */}
        <div className="space-y-1.5">
          <Input
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
            required
            className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-emerald-600 transition-colors duration-200 focus:outline-none"
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

          {/* Thanh đo độ mạnh mật khẩu tối ưu tinh tế */}
          {strength && (
            <div className="pt-1 px-0.5">
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 flex justify-between items-center">
                <span>Độ bảo mật:</span>
                <span className="font-semibold text-gray-600">
                  {strength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={errors.confirmPassword}
          required
          className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
        />

        {/* Nút Đăng ký */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl shadow-sm shadow-emerald-100 transition-all duration-200 hover:shadow-md transform active:scale-[0.99]"
        >
          Tạo tài khoản
        </Button>

        {/* Link Điều hướng */}
        <p className="text-center text-sm text-gray-500 pt-2">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-150 underline decoration-emerald-200 hover:decoration-emerald-500 underline-offset-4"
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
