"use client";
// src/app/become-vendor/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { vendorsService } from "../../services/vendors.service";
import { getErrorMessage } from "../../utils/error";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

interface FormState {
  shopName: string;
  description: string;
  bankAccount: string;
  bankName: string;
}

const STEPS = ["Thông tin shop", "Tài khoản ngân hàng", "Xác nhận"];

export default function BecomeVendorPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    shopName: "",
    description: "",
    bankAccount: "",
    bankName: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    };

  const validateStep = (): boolean => {
    const e: Partial<FormState> = {};
    if (step === 0) {
      if (!form.shopName.trim() || form.shopName.length < 3)
        e.shopName = "Tên shop phải có ít nhất 3 ký tự";
    }
    if (step === 1) {
      if (form.bankAccount && form.bankAccount.length < 6)
        e.bankAccount = "Số tài khoản không hợp lệ";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setServerError("");
    try {
      await vendorsService.registerVendor({
        shopName: form.shopName,
        description: form.description || undefined,
        bankAccount: form.bankAccount || undefined,
        bankName: form.bankName || undefined,
      });
      router.push("/become-vendor/success");
    } catch (err) {
      setServerError(getErrorMessage(err));
      setStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🌿</span>
            </div>
            <span className="text-2xl font-bold text-blue-900">Herbal Shop</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Trở thành nhà cung cấp</h1>
          <p className="text-slate-500 text-sm mt-1">
            Đăng ký shop và bắt đầu bán hàng ngay hôm nay
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    i < step
                      ? "bg-blue-600 text-white"
                      : i === step
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs ${
                    i === step ? "text-blue-600 font-medium" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-12 h-0.5 mb-4 transition-all ${
                    i < step ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-blue-100/50 p-8">
          {serverError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <span>⚠️</span>
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          {/* Step 0: Thông tin shop */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">
                  Thông tin shop
                </h2>
                <p className="text-sm text-slate-500">
                  Điền thông tin cơ bản để tạo shop của bạn
                </p>
              </div>

              <Input
                label="Tên shop"
                placeholder="VD: Thảo Mộc Trường Sơn"
                value={form.shopName}
                onChange={handleChange("shopName")}
                error={errors.shopName}
                required
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mô tả shop
                </label>
                <textarea
                  placeholder="Mô tả ngắn về shop của bạn..."
                  value={form.description}
                  onChange={handleChange("description")}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-gray-400"
                />
              </div>

              <Button fullWidth size="lg" onClick={handleNext}>
                Tiếp theo →
              </Button>
            </div>
          )}

          {/* Step 1: Tài khoản ngân hàng */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">
                  Tài khoản ngân hàng
                </h2>
                <p className="text-sm text-slate-500">
                  Dùng để nhận thanh toán từ đơn hàng (không bắt buộc)
                </p>
              </div>

              <Input
                label="Số tài khoản"
                placeholder="VD: 1234567890"
                value={form.bankAccount}
                onChange={handleChange("bankAccount")}
                error={errors.bankAccount}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
              />

              <Input
                label="Ngân hàng"
                placeholder="VD: Vietcombank"
                value={form.bankName}
                onChange={handleChange("bankName")}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                }
              />

              <div className="flex gap-2 pt-2">
                <Button variant="outline" fullWidth onClick={() => setStep(0)}>
                  ← Quay lại
                </Button>
                <Button fullWidth onClick={handleNext}>
                  Tiếp theo →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Xác nhận */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-1">
                  Xác nhận thông tin
                </h2>
                <p className="text-sm text-slate-500">
                  Kiểm tra lại trước khi gửi đăng ký
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                {[
                  { label: "Tên shop", value: form.shopName },
                  { label: "Mô tả", value: form.description || "—" },
                  { label: "Số tài khoản", value: form.bankAccount || "—" },
                  { label: "Ngân hàng", value: form.bankName || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800 text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <span className="text-amber-500 flex-shrink-0">ℹ️</span>
                <p className="text-xs text-amber-700">
                  Sau khi gửi, shop của bạn sẽ ở trạng thái <strong>chờ duyệt</strong>. Admin sẽ xem xét và phê duyệt trong vòng 24 giờ.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" fullWidth onClick={() => setStep(1)}>
                  ← Quay lại
                </Button>
                <Button fullWidth isLoading={isSubmitting} onClick={handleSubmit}>
                  Gửi đăng ký
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
