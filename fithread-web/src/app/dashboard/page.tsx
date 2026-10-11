"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import SentimentBar, { SentimentLegend } from "@/components/SentimentBar";
import { apiFetch, ApiError } from "@/lib/api";

import { DashboardOverview } from "@/types/dashboard";
import { themeLabel } from "@/lib/themes";

type SortKey = "reviews" | "rating" | "negative";

function Overview() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortKey>("reviews");

  useEffect(() => {
    apiFetch<DashboardOverview>("/dashboard/overview")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const list = [...data.courses];
    if (sort === "rating") list.sort((a, b) => (a.avgRating ?? 99) - (b.avgRating ?? 99));
    else if (sort === "negative") list.sort((a, b) => b.negativeShare - a.negativeShare);
    else list.sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [data, sort]);

  if (error) return <main className="max-w-5xl mx-auto px-4 py-12 text-red-600">{error}</main>;
  if (!data) return <main className="max-w-5xl mx-auto px-4 py-12">Đang tải...</main>;

  const maxTheme = Math.max(...data.topThemes.map((t) => t.count), 1);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-darker">Dashboard chất lượng môn học</h1>
        <p className="text-sm text-ink-muted mt-1">
          Tổng hợp từ đánh giá của sinh viên, phân tích bằng AI. Chỉ hiển thị cho quản lý khoa.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-ink-muted">Tổng số đánh giá</p>
          <p className="text-3xl font-bold text-brand-darker">{data.totalReviews}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-muted">Đã được AI phân tích</p>
          <p className="text-3xl font-bold text-brand-darker">{data.analyzedReviews}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-muted">Đang chờ kiểm duyệt</p>
          <p className="text-3xl font-bold text-brand-darker">{data.pendingModeration}</p>
          {data.pendingModeration > 0 && (
            <Link href="/admin/moderation" className="link-brand text-xs">
              Xem trang kiểm duyệt
            </Link>
          )}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Cảm xúc chung của sinh viên</h2>
        <SentimentBar {...data.sentiment} />
        <SentimentLegend {...data.sentiment} />
      </section>

      <section className="card">
        <h2 className="font-semibold mb-4">Chủ đề được nhắc nhiều nhất</h2>
        {data.topThemes.length === 0 ? (
          <p className="text-sm text-ink-muted">Chưa có dữ liệu.</p>
        ) : (
          <div className="space-y-3">
            {data.topThemes.map((t) => (
              <div key={t.theme}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{themeLabel(t.theme)}</span>
                  <span className="text-ink-muted">
                    {t.count} lượt · {t.negative} tiêu cực
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

      <section>
        <h2 className="font-semibold mb-1">Môn học cần chú ý</h2>
        <p className="text-xs text-ink-muted mb-3">
          Các môn có điểm trung bình thấp nhất, chỉ xét những môn có từ {data.minRequired} đánh giá trở lên.
        </p>
        {data.attentionCourses.length === 0 ? (
          <div className="card text-sm text-ink-muted">Chưa có môn nào đủ số đánh giá tối thiểu.</div>
        ) : (
          <div className="space-y-2">
            {data.attentionCourses.map((c) => (
              <Link
                key={c.courseId}
                href={`/dashboard/course?id=${c.courseId}`}
                className="card-hover flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs text-ink-muted">{c.code}</span>
                  <p className="font-medium">{c.name}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-brand-darker">{c.avgRating?.toFixed(1)} / 5</p>
                  <p className="text-ink-muted">{Math.round(c.negativeShare * 100)}% tiêu cực</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Tất cả môn học có đánh giá</h2>
          <select className="input-field !w-auto text-sm" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="reviews">Nhiều đánh giá nhất</option>
            <option value="rating">Điểm thấp nhất</option>
            <option value="negative">Tiêu cực nhiều nhất</option>
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="card text-sm text-ink-muted">Chưa có môn học nào có đánh giá.</div>
        ) : (
          <div className="space-y-2">
            {rows.map((c) => (
              <Link
                key={c.courseId}
                href={`/dashboard/course?id=${c.courseId}`}
                className="card-hover grid gap-3 sm:grid-cols-[1fr_8rem_12rem] sm:items-center"
              >
                <div>
                  <span className="text-xs text-ink-muted">{c.code}</span>
                  <p className="font-medium">{c.name}</p>
                </div>
                <div className="text-sm">
                  {c.enoughData ? (
                    <span className="font-semibold text-brand-darker">{c.avgRating?.toFixed(1)} / 5</span>
                  ) : (
                    <span className="text-ink-muted">Chưa đủ dữ liệu</span>
                  )}
                  <span className="text-ink-muted"> · {c.reviewCount} đánh giá</span>
                </div>
                <SentimentBar positive={c.positive} neutral={c.neutral} negative={c.negative} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RoleGuard roles={["ADMIN", "FACULTY"]}>
      <Overview />
    </RoleGuard>
  );
}