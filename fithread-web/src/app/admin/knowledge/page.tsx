"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { KnowledgeDoc } from "@/types/chat";

const MAX_CONTENT = 20000;

function KnowledgeManager() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    apiFetch<KnowledgeDoc[]>("/admin/knowledge")
      .then(setDocs)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }

  useEffect(() => {
    load();
  }, []);

  function reset() {
    setEditingId(null);
    setTitle("");
    setCategory("");
    setContent("");
  }

  function startEdit(d: KnowledgeDoc) {
    setEditingId(d.id);
    setTitle(d.title);
    setCategory(d.category ?? "");
    setContent(d.content);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200_000) {
      setError("File quá lớn (tối đa khoảng 200KB văn bản).");
      return;
    }
    file.text().then((text) => {
      setContent(text);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      setError("");
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (content.trim().length > MAX_CONTENT) {
      setError(`Nội dung tối đa ${MAX_CONTENT} ký tự, hãy chia thành nhiều tài liệu.`);
      return;
    }

    setLoading(true);
    try {
      const body = JSON.stringify({ title, category, content });
      if (editingId) {
        await apiFetch<KnowledgeDoc>(`/admin/knowledge/${editingId}`, { method: "PUT", body });
        setSuccess("Đã cập nhật tài liệu.");
      } else {
        await apiFetch<KnowledgeDoc>("/admin/knowledge", { method: "POST", body });
        setSuccess("Đã thêm tài liệu.");
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
    if (!confirm("Xóa tài liệu này?")) return;
    setError("");
    try {
      await apiFetch(`/admin/knowledge/${id}`, { method: "DELETE" });
      if (editingId === id) reset();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1 text-brand-darker">Kho tri thức của chatbot</h1>
      <p className="text-sm text-ink-muted mb-6">
        Chatbot chỉ trả lời dựa trên các tài liệu ở đây và dữ liệu môn học trong hệ thống. Dán nội dung văn bản (giới
        thiệu khoa, tuyển sinh, quy chế, lịch sử 20 năm...) hoặc chọn file .txt/.md. Với PDF hoặc Word, hãy sao chép
        phần chữ ra trước.
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4 mb-10">
        <h2 className="font-semibold">{editingId ? "Sửa tài liệu" : "Thêm tài liệu"}</h2>

        <input
          className="input-field"
          placeholder="Tiêu đề (ví dụ: Giới thiệu Khoa CNTT)"
          required
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Danh mục (không bắt buộc, ví dụ: Tuyển sinh)"
          maxLength={100}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div>
          <textarea
            className="input-field"
            rows={10}
            placeholder="Nội dung tài liệu..."
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={handleFile} />
            <span className={content.length > MAX_CONTENT ? "text-red-600" : ""}>
              {content.length}/{MAX_CONTENT}
            </span>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-700 text-sm">{success}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm tài liệu"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="btn-secondary">
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <h2 className="font-semibold mb-3">Tài liệu hiện có ({docs.length})</h2>
      {docs.length === 0 ? (
        <p className="text-sm text-ink-muted">Chưa có tài liệu nào.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.id} className="card flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium">{d.title}</p>
                <p className="text-xs text-ink-muted">
                  {d.category ? `${d.category} · ` : ""}
                  {d.content.length} ký tự · cập nhật {new Date(d.updatedAt).toLocaleString("vi-VN")}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{d.content}</p>
              </div>
              <div className="flex shrink-0 gap-3 text-sm">
                <button onClick={() => startEdit(d)} className="link-brand">
                  Sửa
                </button>
                <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">
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

export default function AdminKnowledgePage() {
  return (
    <AdminGuard>
      <KnowledgeManager />
    </AdminGuard>
  );
}