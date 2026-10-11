"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { ReviewPage } from "@/types/review";
import { StarDisplay } from "./StarRating";

interface Props {
  courseId: number;
  refreshKey: number;
  onEdit: (offeringId: number) => void;
  onChanged: () => void;
}

export default function ReviewList({ courseId, refreshKey, onEdit, onChanged }: Props) {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ReviewPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiFetch<ReviewPage>(`/courses/${courseId}/reviews?page=${page}&size=10`)
      .then((res) => {
        if (cancelled) return;
        if (res.content.length === 0 && page > 0) {
          setPage(page - 1); // vừa xóa/ẩn hết đánh giá ở trang cuối
          return;
        }
        setData(res);
        setLoadError("");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, page, refreshKey]);

  async function handleDelete(reviewId: number) {
    if (!confirm("Xóa đánh giá này?")) return;
    setNotice(null);
    try {
      await apiFetch(`/reviews/${reviewId}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      setNotice({ type: "error", text: err instanceof ApiError ? err.message : "Có lỗi xảy ra" });
    }
  }

  async function handleReport(reviewId: number) {
    const reason = window.prompt("Lý do báo cáo (không bắt buộc):");
    if (reason === null) return; // bấm Hủy
    setNotice(null);
    try {
      await apiFetch(`/reviews/${reviewId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setNotice({ type: "ok", text: "Đã gửi báo cáo. Cảm ơn bạn!" });
      onChanged(); // làm mới danh sách phòng khi đánh giá vừa bị tự động ẩn
    } catch (err) {
      setNotice({ type: "error", text: err instanceof ApiError ? err.message : "Có lỗi xảy ra" });
    }
  }

  if (loading && !data) return <p className="text-ink-muted text-sm">Đang tải...</p>;
  if (loadError) return <p className="text-red-600 text-sm">{loadError}</p>;
  if (!data || data.content.length === 0) {
    return <p className="text-ink-muted text-sm">Chưa có đánh giá nào cho môn học này.</p>;
  }

  return (
    <div className="space-y-3">
      {notice && (
        <p className={`text-sm ${notice.type === "ok" ? "text-green-700" : "text-red-600"}`}>{notice.text}</p>
      )}

      {data.content.map((r) => (
        <div key={r.id} className="card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="badge">
                {r.lecturerName} — {r.semester}
              </span>
              {r.mine && (
                <span className="inline-block text-xs bg-brand-dark text-white rounded px-2 py-0.5">
                  Đánh giá của bạn
                </span>
              )}
            </div>
            <StarDisplay value={r.average} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
            {r.scores.map((s) => (
              <span key={s.criterionId}>
                {s.criterionName}: <strong className="text-ink">{s.score}</strong>
              </span>
            ))}
          </div>

          <p className="whitespace-pre-wrap text-sm">{r.comment}</p>

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
            <div className="flex gap-3">
              {r.mine ? (
                <>
                  <button onClick={() => onEdit(r.offeringId)} className="link-brand">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">
                    Xóa
                  </button>
                </>
              ) : (
                <button onClick={() => handleReport(r.id)} className="hover:text-red-600 hover:underline">
                  Báo cáo
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {data.totalPages > 1 && (
        <div className="flex gap-2 pt-2 justify-center">
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
    </div>
  );
}