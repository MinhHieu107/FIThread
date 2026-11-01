"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setInfo("Nếu email tồn tại trong hệ thống, mã đặt lại mật khẩu đã được gửi. Mã có hiệu lực 15 phút.");
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <main className="max-w-md mx-auto px-4 py-12 space-y-4">
        <h1 className="text-2xl font-bold text-brand-darker">Đã đặt lại mật khẩu</h1>
        <p className="text-sm">Bạn có thể đăng nhập bằng mật khẩu mới. Các thiết bị khác sẽ bị đăng xuất.</p>
        <Link href="/login" className="btn-primary inline-block">
          Đến trang đăng nhập
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2 text-brand-darker">Quên mật khẩu</h1>
      <p className="text-sm text-ink-muted mb-6">
        Nhập email đăng nhập của bạn. Nếu là cựu sinh viên đã có email dự phòng được xác thực, mã sẽ được gửi tới cả hai
        email.
      </p>

      {step === "email" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <input
            type="email"
            className="input-field"
            placeholder="Email đăng nhập"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Đang gửi..." : "Gửi mã"}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          {info && <p className="text-green-700 text-sm">{info}</p>}
          <input
            className="input-field"
            placeholder="Mã OTP 6 số"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Mật khẩu mới (8 đến 72 ký tự)"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Nhập lại mật khẩu mới"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
              setOtp("");
            }}
            className="link-brand text-sm w-full"
          >
            Gửi lại mã hoặc đổi email
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="link-brand">
          Quay lại đăng nhập
        </Link>
      </p>
    </main>
  );
}