"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError, saveTokens } from "@/lib/api";
import { LoginPayload, TokenPairResponse } from "@/types/auth";
import Link from "next/link"
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginPayload>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<TokenPairResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveTokens(res.accessToken, res.refreshToken);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Co loi xay ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          className="input-field"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          required
          className="input-field"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
          <p className="text-sm text-center">
          <Link href="/forgot-password" className="link-brand">
            Quên mật khẩu?
          </Link>
        </p>
        
<div className="space-y-3 pt-2">
  <p className="text-sm text-ink-muted text-center">
    Chưa có tài khoản?
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Link
      href="/register"
      className="flex items-center justify-center rounded-lg border border-brand px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand hover:text-white"
    >
      Đăng ký
    </Link>

    <Link
      href="/register/alumni"
      className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
    >
      Đăng ký cựu sinh viên
    </Link>
  </div>
</div>

      </form>
    </main>
  );
}