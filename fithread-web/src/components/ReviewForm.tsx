"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { OfferingResponse } from "@/types/course";
import { Review, RubricCriterion } from "@/types/review";
import { StarInput } from "./StarRating";

interface Props {
  offerings: OfferingResponse[];
  criteria: RubricCriterion[];
  myReviews: Review[];
  selectedOfferingId: number | "";
  onSelectOffering: (id: number | "") => void;
  onChanged: () => void;
}

export default function ReviewForm({
  offerings,
  criteria,
  myReviews,
  selectedOfferingId,
  onSelectOffering,
  onChanged,
}: Props) {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const existing = myReviews.find((r) => r.offeringId === selectedOfferingId) ?? null;
  const reviewedIds = new Set(myReviews.map((r) => r.offeringId));

  useEffect(() => {
    if (existing) {
      const map: Record<number, number> = {};
      existing.scores.forEach((s) => {
        map[s.criterionId] = s.score;
      });
      setScores(map);
      setComment(existing.comment);
    } else {
      setScores({});
      setComment("");
    }
    setError("");
  }, [existing]);

  function handleSelect(value: string) {
    setSuccess("");
    onSelectOffering(value ? Number(value) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedOfferingId) {
      setError("Vui lòng chọn giảng viên / học kỳ.");
      return;
    }
    if (criteria.some((c) => !scores[c.id])) {
      setError("Vui lòng chấm điểm đủ tất cả các tiêu chí.");
      return;
    }
    const trimmed = comment.trim();
    if (trimmed.length < 20) {
      setError("Nhận xét cần ít nhất 20 ký tự.");
      return;
    }
    if (trimmed.length > 2000) {
      setError("Nhận xét tối đa 2000 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const body = JSON.stringify({
        scores: criteria.map((c) => ({ criterionId: c.id, score: scores[c.id] })),
        comment: trimmed,
      });

      if (existing) {
        await apiFetch<Review>(`/reviews/${existing.id}`, { method: "PUT", body });
        setSuccess("Đã cập nhật đánh giá.");
      } else {
        await apiFetch<Review>(`/offerings/${selectedOfferingId}/reviews`, { method: "POST", body });
        setSuccess("Đã gửi đánh giá. Cảm ơn bạn!");
      }
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existing || !confirm("Xóa đánh giá này?")) return;

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiFetch(`/reviews/${existing.id}`, { method: "DELETE" });
      setSuccess("Đã xóa đánh giá.");
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  if (criteria.length === 0) {
    return <div className="card text-sm text-ink-muted">Đang tải tiêu chí đánh giá...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <h2 className="font-semibold">{existing ? "Sửa đánh giá của bạn" : "Viết đánh giá"}</h2>
        <p className="text-xs text-ink-muted mt-1">Đánh giá của bạn được hiển thị ẩn danh.</p>
      </div>
        {existing && existing.status !== "PUBLISHED" && (
            <div className="rounded-md bg-brand-light px-3 py-2 text-sm">
                Đánh giá này đang bị ẩn và chờ admin xem xét nên người khác chưa nhìn thấy. Bạn vẫn có thể sửa hoặc xóa.
            </div>
        )}
      <select
        className="input-field"
        value={selectedOfferingId}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">-- Chọn giảng viên / học kỳ --</option>
        {offerings.map((o) => (
          <option key={o.id} value={o.id}>
            {o.lecturerName} — {o.semester}
            {reviewedIds.has(o.id) ? " (đã đánh giá)" : ""}
          </option>
        ))}
      </select>

      {selectedOfferingId !== "" && (
        <>
          <div className="space-y-4">
            {criteria.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                <div className="max-w-md">
                  <p className="font-medium text-sm">{c.name}</p>
                  {c.description && <p className="text-xs text-ink-muted">{c.description}</p>}
                </div>
                <StarInput
                  value={scores[c.id] ?? 0}
                  onChange={(v) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                />
              </div>
            ))}
          </div>

          <div>
            <textarea
              className="input-field"
              rows={5}
              placeholder="Chia sẻ nhận xét của bạn về môn học (ít nhất 20 ký tự)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className="text-xs text-ink-muted text-right">{comment.trim().length}/2000</p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-700 text-sm">{success}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Đang xử lý..." : existing ? "Cập nhật" : "Gửi đánh giá"}
            </button>
            {existing && (
              <button type="button" onClick={handleDelete} disabled={loading} className="btn-secondary">
                Xóa đánh giá
              </button>
            )}
          </div>
        </>
      )}

      {selectedOfferingId === "" && success && <p className="text-green-700 text-sm">{success}</p>}
    </form>
  );
}