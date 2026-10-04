"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError, saveTokens } from "@/lib/api";
import { LoginPayload, TokenPairResponse } from "@/types/auth";

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
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-md py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}