"use client";

import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { getAccessTokenForUpload } from "@/lib/api";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = getAccessTokenForUpload();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/admin/catalog/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Có lỗi xảy ra" }));
        throw new Error(body.message || "Có lỗi xảy ra");
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Nhập danh sách môn học</h1>
      <p className="text-ink-muted text-sm mb-6">
        File CSV có header: course_code,course_name,credits,specialization,is_required
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {result && (
          <p className="text-green-600 text-sm">
            Đã tạo mới {result.created} môn, cập nhật {result.updated} môn, bỏ qua {result.skipped} dòng lỗi.
          </p>
        )}
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-brand hover:bg-brand-dark text-white rounded-md px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Đang nhập..." : "Nhập dữ liệu"}
        </button>
      </form>
    </main>
  );
}

export default function AdminCatalogPage() {
  return (
    <AdminGuard>
      <ImportForm />
    </AdminGuard>
  );
}