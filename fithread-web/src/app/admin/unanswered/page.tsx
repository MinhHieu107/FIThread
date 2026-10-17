"use client";

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { UnansweredQuestion } from "@/types/chat";

function UnansweredManager() {
  const [showResolved, setShowResolved] = useState(false);
  const [items, setItems] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiFetch<UnansweredQuestion[]>(`/admin/unanswered?resolved=${showResolved}`)
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"))
      .finally(() => setLoading(false));
  }, [showResolved]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: number, action: "resolve" | "delete") {
    setError("");
    try {
      if (action === "resolve") {
        await apiFetch(`/admin/unanswered/${id}/resolve`, { method: "POST", body: JSON.stringify({}) });
      } else {
        await apiFetch(`/admin/unanswered/${id}`, { method: "DELETE" });
      }
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1 text-brand-darker">Câu hỏi chatbot chưa trả lời được</h1>
      <p className="text-sm text-ink-muted mb-6">
        Đây là các câu hỏi thuộc phạm vi khoa, trường nhưng kho tri thức chưa có thông tin. Hãy bổ sung tài liệu ở trang
        Kho tri thức rồi đánh dấu đã xử lý.
      </p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setShowResolved(false)} className={!showResolved ? "btn-primary" : "btn-secondary"}>
          Chưa xử lý
        </button>
        <button onClick={() => setShowResolved(true)} className={showResolved ? "btn-primary" : "btn-secondary"}>
          Đã xử lý
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Đang tải...</p>}
      {!loading && items.length === 0 && <p className="text-ink-muted text-sm">Không có câu hỏi nào.</p>}

      <div className="space-y-2">
        {items.map((q) => (
          <div key={q.id} className="card flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">{q.question}</p>
              <p className="text-xs text-ink-muted">{new Date(q.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              {!q.resolved && (
                <button onClick={() => act(q.id, "resolve")} className="link-brand">
                  Đã xử lý
                </button>
              )}
              <button onClick={() => act(q.id, "delete")} className="text-red-600 hover:underline">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function AdminUnansweredPage() {
  return (
    <AdminGuard>
      <UnansweredManager />
    </AdminGuard>
  );
}