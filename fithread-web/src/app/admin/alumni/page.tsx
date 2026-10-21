"use client";

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError, getAccessTokenForUpload } from "@/lib/api";
import { AlumniApplication } from "@/types/alumni";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

const TABS = [
  { key: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { key: "REJECTED", label: "Đã từ chối" },
];

function AlumniApproval() {
  const [tab, setTab] = useState("PENDING_APPROVAL");
  const [items, setItems] = useState<AlumniApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiFetch<AlumniApplication[]>(`/admin/alumni/applications?status=${tab}`)
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function viewPhoto(userId: number) {
    setError("");
    try {
      await apiFetch("/auth/me"); // làm mới token nếu đã hết hạn trước khi tải ảnh
      const token = getAccessTokenForUpload();
      const res = await fetch(`${API_BASE}/admin/alumni/${userId}/photo`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Không tải được ảnh" }));
        throw new Error(body.message || "Không tải được ảnh");
      }
      setPhotoUrl(URL.createObjectURL(await res.blob()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được ảnh");
    }
  }

  function closePhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
  }

  async function approve(userId: number) {
    if (!confirm("Duyệt hồ sơ này? Ảnh thẻ sẽ bị xóa ngay sau khi duyệt.")) return;
    setError("");
    try {
      await apiFetch(`/admin/alumni/${userId}/approve`, { method: "POST", body: JSON.stringify({}) });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  async function reject(userId: number) {
    const reason = window.prompt("Lý do từ chối (bắt buộc, sẽ gửi cho người nộp hồ sơ qua email):");
    if (reason === null) return;
    if (reason.trim().length < 5) {
      setError("Vui lòng nhập lý do từ chối (ít nhất 5 ký tự).");
      return;
    }
    setError("");
    try {
      await apiFetch(`/admin/alumni/${userId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1 text-brand-darker">Duyệt hồ sơ cựu sinh viên</h1>
      <p className="text-sm text-ink-muted mb-6">
        Đối chiếu ảnh thẻ sinh viên cũ với họ tên, khóa và năm tốt nghiệp. Ảnh bị xóa ngay sau khi duyệt hoặc từ chối.
        Hồ sơ bị từ chối có thể được duyệt lại ở tab &quot;Đã từ chối&quot; khi người nộp liên hệ bổ sung minh chứng.
      </p>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "btn-primary" : "btn-secondary"}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-ink-muted text-sm">Đang tải...</p>}
      {!loading && items.length === 0 && <p className="text-ink-muted text-sm">Không có hồ sơ nào trong mục này.</p>}

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.userId} className="card space-y-3">
            <div>
              <p className="font-medium">{a.fullName}</p>
              <p className="text-sm text-ink-muted">{a.email}</p>
              <p className="text-sm text-ink-muted">
                {a.cohort} · Tốt nghiệp {a.graduationYear} · nộp {new Date(a.appliedAt).toLocaleString("vi-VN")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {a.hasPhoto ? (
                <button onClick={() => viewPhoto(a.userId)} className="link-brand text-sm">
                  Xem ảnh thẻ
                </button>
              ) : (
                <span className="text-xs text-ink-muted">Ảnh thẻ đã được xóa</span>
              )}
              <div className="flex gap-2">
                <button onClick={() => approve(a.userId)} className="btn-primary">
                  Duyệt
                </button>
                {tab === "PENDING_APPROVAL" && (
                  <button onClick={() => reject(a.userId)} className="btn-secondary">
                    Từ chối
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closePhoto}
          role="dialog"
          aria-label="Ảnh thẻ sinh viên"
        >
          <div className="max-h-full max-w-2xl rounded-lg bg-white p-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="Ảnh thẻ sinh viên cũ" className="max-h-[75vh] rounded" />
            <button onClick={closePhoto} className="btn-secondary mt-3 w-full">
              Đóng
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminAlumniPage() {
  return (
    <AdminGuard>
      <AlumniApproval />
    </AdminGuard>
  );
}