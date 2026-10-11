"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import SentimentBar, { SentimentLegend } from "@/components/SentimentBar";
import { apiFetch, ApiError } from "@/lib/api";

import { DashboardCourse } from "@/types/dashboard";
import { themeLabel } from "@/lib/themes";

function CourseInsight() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<DashboardCourse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Thiếu mã môn học");
      return;
    }
    apiFetch<DashboardCourse>(`/dashboard/courses/${id}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }, [id]);

  if (error) return <main className="max-w-3xl mx-auto px-4 py-12 text-red-600">{error}</main>;
  if (!data) return <main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>;

  const maxTheme = Math.max(...data.themes.map((t) => t.count), 1);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <Link href="/dashboard" className="link-brand text-sm">
          ← Về dashboard
        </Link>
        <p className="text-ink-muted mt-3">{data.code}</p>
        <h1 className="text-2xl font-bold text-brand-darker">{data.name}</h1>
        <div className="flex gap-2 mt-2">
          <span className="badge">{data.credits} tín chỉ</span>
          {data.specialization && <span className="badge">{data.specialization}</span>}
          <span className="badge">{data.reviewCount} đánh giá</span>
        </div>
      </div>

      {!data.enoughData ? (
        <div className="card text-sm text-ink-muted">
          Môn học này mới có {data.reviewCount} đánh giá, cần ít nhất {data.minRequired} đánh giá để hiển thị phân tích.
        </div>
      ) : (
        <>
          <section className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Nhận định của AI</h2>
              {data.avgRating !== null && (
                <span className="text-2xl font-bold text-brand-darker">{data.avgRating.toFixed(1)} / 5</span>
              )}
            </div>

            {data.summary ? (
              <>
                <p className="text-sm leading-relaxed">{data.summary.overview}</p>

                {data.summary.strengths.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-1">Điểm mạnh</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {data.summary.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.summary.improvements.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-1">Cần cải thiện</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {data.summary.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-ink-muted">
                  Dựa trên {data.summary.reviewsCovered} đánh giá · cập nhật{" "}
                  {new Date(data.summary.generatedAt).toLocaleString("vi-VN")}. Đây là gợi ý do AI tổng hợp, cần được
                  người quản lý đối chiếu trước khi ra quyết định.
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted">AI đang tổng hợp, vui lòng quay lại sau ít phút.</p>
            )}
          </section>

          <section className="card space-y-3">
            <h2 className="font-semibold">Cảm xúc trong nhận xét</h2>
            <SentimentBar {...data.sentiment} />
            <SentimentLegend {...data.sentiment} />
          </section>

          <section className="card">
            <h2 className="font-semibold mb-4">Điểm theo tiêu chí</h2>
            <div className="space-y-3">
              {data.criteria.map((c) => (
                <div key={c.criterionId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.name}</span>
                    <span className="text-ink-muted">{c.average.toFixed(1)}</span>
                  </div>
                  <div className="h-2 rounded bg-brand-light">
                    <div className="h-2 rounded bg-brand-dark" style={{ width: `${(c.average / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="font-semibold mb-4">Chủ đề được nhắc đến</h2>
            {data.themes.length === 0 ? (
              <p className="text-sm text-ink-muted">Chưa có dữ liệu.</p>
            ) : (
              <div className="space-y-3">
                {data.themes.map((t) => (
                  <div key={t.theme}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{themeLabel(t.theme)}</span>
                      <span className="text-ink-muted">
                        {t.count} lượt · {t.positive} tích cực · {t.negative} tiêu cực
                      </span>
                    </div>
                    <div className="h-2 rounded bg-brand-light">
                      <div className="h-2 rounded bg-brand-dark" style={{ width: `${(t.count / maxTheme) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Link href={`/courses/detail?id=${data.courseId}`} className="link-brand text-sm">
        Xem trang môn học như sinh viên thấy →
      </Link>
    </main>
  );
}

export default function DashboardCoursePage() {
  return (
    <RoleGuard roles={["ADMIN", "FACULTY"]}>
      <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>}>
        <CourseInsight />
      </Suspense>
    </RoleGuard>
  );
}