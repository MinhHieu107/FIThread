"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { ApiMessageResponse } from "@/types/auth";
import Link from "next/link";
function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingMessage, setPendingMessage] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
            const res = await apiFetch<{ message: string; status: string }>("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      if (res.status === "PENDING_APPROVAL") {
        setPendingMessage(res.message);
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    try {
      const res = await apiFetch<ApiMessageResponse>("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setInfo(res.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }
    if (pendingMessage) {
    return (
      <main className="max-w-md mx-auto px-4 py-12 space-y-4">
        <h1 className="text-2xl font-bold text-brand-darker">Đã xác thực email</h1>
        <p className="text-sm">{pendingMessage}</p>
        <Link href="/" className="link-brand text-sm">
          Về trang chủ
        </Link>
      </main>
    );
  }
  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Xác thực email</h1>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mã OTP (6 số)"
          required
          maxLength={6}
          className="input-field"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {info && <p className="text-green-600 text-sm">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Đang xử lý..." : "Xác thực"}
        </button>
        <button
          type="button"
          onClick={handleResend}
          className="w-full text-brand-dark text-sm py-1"
        >
          Gửi lại mã OTP
        </button>
      </form>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}