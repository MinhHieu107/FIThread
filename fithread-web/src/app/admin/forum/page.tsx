"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { ForumModerationRow } from "@/types/forum";

const TABS = [
  { key: "PENDING_MODERATION", label: "Chờ duyệt" },
  { key: "REPORTED", label: "Bị báo cáo" },
  { key: "HIDDEN", label: "Đã ẩn" },
];

function ForumModeration() {
  const [tab, setTab] = useState("PENDING_MODERATION");
  const [items, setItems] = useState<ForumModerationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiFetch<ForumModerationRow[]>(`/admin/forum/posts?status=${tab}`)
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function hide(id: number) {
    const reason = window.prompt("Lý do ẩn bài (bắt buộc, ít nhất 5 ký tự):");
    if (reason === null) return;
    if (reason.trim().length < 5) {
      setError("Vui lòng nhập lý do ẩn (ít nhất 5 ký tự).");
      return;
    }
    setError("");
    try {
      await apiFetch(`/admin/forum/posts/${id}/hide`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  async function restore(id: number) {
    setError("");
    try {
      await apiFetch(`/admin/forum/posts/${id}/restore`, { method: "POST", body: JSON.stringify({}) });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-brand-darker">Kiểm duyệt diễn đàn</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "btn-primary" : "btn-secondary"}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Đang tải...</p>}
      {!loading && items.length === 0 && <p className="text-ink-muted text-sm">Không có bài nào trong mục này.</p>}

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{p.authorName}</p>
                <p className="text-xs text-ink-muted">{new Date(p.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <span className="badge">{p.reportCount} báo cáo</span>
            </div>

            <p className="whitespace-pre-wrap text-sm">{p.content}</p>

            {p.reasons.length > 0 && (
              <div className="rounded-md bg-brand-lighter px-3 py-2 text-sm">
                <p className="font-medium mb-1">Lý do báo cáo:</p>
                <ul className="list-disc pl-5 text-ink-muted">
                  {p.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {p.history.length > 0 && (
              <div className="rounded-md bg-brand-lighter px-3 py-2 text-sm space-y-1">
                <p className="font-medium">Lịch sử xử lý:</p>
                {p.history.map((h, i) => (
                  <p key={i} className="text-ink-muted">
                    {new Date(h.createdAt).toLocaleString("vi-VN")} · {h.adminName} ·{" "}
                    {h.action === "HIDE" ? "Ẩn" : "Hiển thị lại"}
                    {h.reason ? `: ${h.reason}` : ""}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/forum/thread?id=${p.rootId}`} className="link-brand text-sm">
                Xem cuộc thảo luận
              </Link>
              <div className="flex gap-2">
                <button onClick={() => restore(p.id)} className="btn-secondary">
                  {tab === "REPORTED" ? "Bỏ qua báo cáo" : "Hiển thị lại"}
                </button>
                {tab !== "HIDDEN" && (
                  <button onClick={() => hide(p.id)} className="btn-primary">
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

export default function AdminForumPage() {
  return (
    <AdminGuard>
      <ForumModeration />
    </AdminGuard>
  );
}