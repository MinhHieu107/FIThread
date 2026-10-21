"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { AlumniPage } from "@/types/alumni";

export default function AlumniDirectoryPage() {
  const currentYear = new Date().getFullYear();

  const [industries, setIndustries] = useState<string[]>([]);
  const [form, setForm] = useState({ q: "", industry: "", year: "" });
  const [filters, setFilters] = useState({ q: "", industry: "", year: "" });
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AlumniPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<string[]>("/alumni/industries").then(setIndustries).catch(() => setIndustries([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.industry) params.set("industry", filters.industry);
    if (filters.year) params.set("year", filters.year);
    params.set("page", String(page));
    params.set("size", "12");

    apiFetch<AlumniPage>(`/alumni?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setFilters(form);
  }

  const years: number[] = [];
  for (let y = currentYear; y >= 2006; y--) years.push(y);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1 text-brand-darker">Cựu sinh viên FIT</h1>
      <p className="text-sm text-ink-muted mb-6">Kết nối với các thế hệ đi trước của Khoa CNTT – HANU.</p>

      <form onSubmit={handleSearch} className="grid gap-2 sm:grid-cols-[1fr_12rem_8rem_auto] mb-6">
        <input
          className="input-field !mb-0"
          placeholder="Tìm theo tên, công ty, vị trí..."
          value={form.q}
          onChange={(e) => setForm({ ...form, q: e.target.value })}
        />
        <select
          className="input-field !mb-0"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
        >
          <option value="">Mọi ngành nghề</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <select
          className="input-field !mb-0"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        >
          <option value="">Mọi năm</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary">
          Tìm
        </button>
      </form>

      {loading && !data && <p className="text-ink-muted text-sm">Đang tải...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && data.content.length === 0 && (
        <p className="text-ink-muted text-sm">Chưa có cựu sinh viên nào phù hợp.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {data?.content.map((a) => (
          <Link key={a.id} href={`/alumni/detail?id=${a.id}`} className="card-hover block">
            <p className="font-medium">{a.fullName}</p>
            <p className="text-xs text-ink-muted">
              {a.cohort ? `${a.cohort} · ` : ""}Tốt nghiệp {a.graduationYear}
            </p>
            {(a.positionTitle || a.company) && (
              <p className="mt-2 text-sm">{[a.positionTitle, a.company].filter(Boolean).join(" tại ")}</p>
            )}
            {a.industry && <span className="badge mt-2">{a.industry}</span>}
          </Link>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex gap-2 pt-6 justify-center">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">
            Trước
          </button>
          <span className="px-3 py-2 text-sm text-ink-muted">
            Trang {page + 1}/{data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </main>
  );
}