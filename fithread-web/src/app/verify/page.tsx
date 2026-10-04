"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { ApiMessageResponse } from "@/types/auth";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      await apiFetch<ApiMessageResponse>("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      router.push("/login");
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

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Xác thực email</h1>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mã OTP (6 số)"
          required
          maxLength={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {info && <p className="text-green-600 text-sm">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-md py-2 font-medium disabled:opacity-50"
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