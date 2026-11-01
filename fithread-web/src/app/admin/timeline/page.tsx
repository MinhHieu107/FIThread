"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { TimelineEvent } from "@/types/timeline";

function TimelineManager() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    apiFetch<TimelineEvent[]>("/admin/timeline")
      .then(setEvents)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }

  useEffect(() => {
    load();
  }, []);

  function reset() {
    setEditingId(null);
    setYear("");
    setTitle("");
    setDescription("");
  }

  function startEdit(e: TimelineEvent) {
    setEditingId(e.id);
    setYear(String(e.year));
    setTitle(e.title);
    setDescription(e.description ?? "");
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body = JSON.stringify({ year: Number(year), title, description });
      if (editingId) {
        await apiFetch<TimelineEvent>(`/admin/timeline/${editingId}`, { method: "PUT", body });
        setSuccess("Đã cập nhật sự kiện.");
      } else {
        await apiFetch<TimelineEvent>("/admin/timeline", { method: "POST", body });
        setSuccess("Đã thêm sự kiện.");
      }
      reset();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xóa sự kiện này?")) return;
    setError("");
    try {
      await apiFetch(`/admin/timeline/${id}`, { method: "DELETE" });
      if (editingId === id) reset();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1 text-brand-darker">Dòng thời gian 20 năm</h1>
      <p className="text-sm text-ink-muted mb-6">
        Các sự kiện hiển thị công khai tại trang Dòng thời gian, xếp theo năm.
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4 mb-10">
        <h2 className="font-semibold">{editingId ? "Sửa sự kiện" : "Thêm sự kiện"}</h2>

        <input
          type="number"
          className="input-field"
          placeholder="Năm (ví dụ 2006)"
          required
          min={1900}
          max={2100}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Tiêu đề sự kiện"
          required
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input-field"
          rows={4}
          maxLength={2000}
          placeholder="Mô tả (không bắt buộc)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-700 text-sm">{success}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm sự kiện"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="btn-secondary">
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <h2 className="font-semibold mb-3">Các sự kiện ({events.length})</h2>
      {events.length === 0 ? (
        <p className="text-sm text-ink-muted">Chưa có sự kiện nào.</p>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.id} className="card flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="badge">{e.year}</span>
                <p className="mt-1 font-medium">{e.title}</p>
                {e.description && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{e.description}</p>}
              </div>
              <div className="flex shrink-0 gap-3 text-sm">
                <button onClick={() => startEdit(e)} className="link-brand">
                  Sửa
                </button>
                <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function AdminTimelinePage() {
  return (
    <AdminGuard>
      <TimelineManager />
    </AdminGuard>
  );
}