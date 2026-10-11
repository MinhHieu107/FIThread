"use client";

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { ModerationReview } from "@/types/review";

const TABS = [
  { key: "PENDING_MODERATION", label: "Chờ duyệt" },
  { key: "REPORTED", label: "Bị báo cáo" },
  { key: "HIDDEN", label: "Đã ẩn" },
];

function ModerationManager() {
  const [tab, setTab] = useState("PENDING_MODERATION");
  const [items, setItems] = useState<ModerationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiFetch<ModerationReview[]>(`/admin/moderation/reviews?status=${tab}`)
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: number, action: "hide" | "restore") {
    if (action === "hide" && !confirm("Ẩn hẳn đánh giá này?")) return;
    setError("");
    try {
      await apiFetch(`/admin/moderation/reviews/${id}/${action}`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-brand-darker">Kiểm duyệt đánh giá</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? "btn-primary" : "btn-secondary"}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Đang tải...</p>}
      {!loading && items.length === 0 && (
        <p className="text-ink-muted text-sm">Không có đánh giá nào trong mục này.</p>
      )}

      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id} className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-sm text-ink-muted">{r.courseCode}</span>
                <p className="font-medium">
                  {r.courseName} — {r.lecturerName} — {r.semester}
                </p>
              </div>
              <span className="badge">{r.reportCount} báo cáo</span>
            </div>

            <p className="whitespace-pre-wrap text-sm">{r.comment}</p>

            {r.reasons.length > 0 && (
              <div className="rounded-md bg-brand-lighter px-3 py-2 text-sm">
                <p className="font-medium mb-1">Lý do báo cáo:</p>
                <ul className="list-disc pl-5 text-ink-muted">
                  {r.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted">{new Date(r.createdAt).toLocaleString("vi-VN")}</span>
              <div className="flex gap-2">
                <button onClick={() => act(r.id, "restore")} className="btn-secondary">
                  {tab === "REPORTED" ? "Bỏ qua báo cáo" : "Hiển thị lại"}
                </button>
                {tab !== "HIDDEN" && (
                  <button onClick={() => act(r.id, "hide")} className="btn-primary">
                    Ẩn hẳn
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function AdminModerationPage() {
  return (
    <AdminGuard>
      <ModerationManager />
    </AdminGuard>
  );
}