"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { Course, PageResponse } from "@/types/course";

function CoursesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", String(page));
    params.set("size", "20");

    apiFetch<PageResponse<Course>>(`/courses?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setCourses(res.content);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    router.push(`/courses?q=${encodeURIComponent(query)}`);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Môn học</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Tìm theo mã môn hoặc tên môn..."
          className="input-field flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary"
        >
          Tìm
        </button>
      </form>

      {loading && <p className="text-ink-muted">Đang tải...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p className="text-ink-muted">Không tìm thấy môn học nào.</p>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/detail?id=${course.id}`}
            className="card-hover block"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-ink-muted">{course.code}</span>
                <h2 className="font-medium">{course.name}</h2>
                {course.specialization && (
                  <span className="badge mt-1">
                    {course.specialization}
                  </span>
                )}
              </div>
              <span className="text-sm text-ink-muted">{course.credits} tín chỉ</span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-6 justify-center">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
          >
            Trước
          </button>
          <span className="px-3 py-1 text-gray-600">
            Trang {page + 1}/{totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </main>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<main className="max-w-4xl mx-auto px-4 py-12">Đang tải...</main>}>
      <CoursesList />
    </Suspense>
  );
}