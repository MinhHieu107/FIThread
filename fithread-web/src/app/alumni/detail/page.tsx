"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { AlumniDetail } from "@/types/alumni";

function Detail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<AlumniDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Thiếu mã hồ sơ");
      return;
    }
    apiFetch<AlumniDetail>(`/alumni/${id}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }, [id]);

  if (error) return <main className="max-w-2xl mx-auto px-4 py-12 text-red-600">{error}</main>;
  if (!data) return <main className="max-w-2xl mx-auto px-4 py-12">Đang tải...</main>;

  const safeLinkedin = data.linkedinUrl && data.linkedinUrl.startsWith("https://") ? data.linkedinUrl : null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <Link href="/alumni" className="link-brand text-sm">
        ← Danh sách cựu sinh viên
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-brand-darker">{data.fullName}</h1>
        <p className="text-sm text-ink-muted">
          {data.cohort ? `${data.cohort} · ` : ""}Tốt nghiệp {data.graduationYear}
        </p>
        <div className="flex gap-2 mt-2">
          {data.industry && <span className="badge">{data.industry}</span>}
        </div>
      </div>

      {(data.positionTitle || data.company) && (
        <section className="card">
          <h2 className="font-semibold mb-1">Công việc hiện tại</h2>
          <p className="text-sm">{[data.positionTitle, data.company].filter(Boolean).join(" tại ")}</p>
        </section>
      )}

      {data.bio && (
        <section className="card">
          <h2 className="font-semibold mb-1">Giới thiệu</h2>
          <p className="text-sm whitespace-pre-wrap">{data.bio}</p>
        </section>
      )}

      <section className="card">
        <h2 className="font-semibold mb-1">Liên hệ</h2>
        {data.contactVisible && (safeLinkedin || data.email) ? (
          <div className="space-y-1 text-sm">
            {safeLinkedin && (
              <p>
                LinkedIn:{" "}
                <a href={safeLinkedin} target="_blank" rel="noopener noreferrer" className="link-brand">
                  {safeLinkedin}
                </a>
              </p>
            )}
            {data.email && (
              <p>
                Email:{" "}
                <a href={`mailto:${data.email}`} className="link-brand">
                  {data.email}
                </a>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Cựu sinh viên này chưa chia sẻ thông tin liên hệ.</p>
        )}
      </section>
    </main>
  );
}

export default function AlumniDetailPage() {
  return (
    <Suspense fallback={<main className="max-w-2xl mx-auto px-4 py-12">Đang tải...</main>}>
      <Detail />
    </Suspense>
  );
}