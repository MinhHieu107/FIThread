"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { UserPage, UserRow } from "@/types/account";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Sinh viên",
  ALUMNI: "Cựu sinh viên",
  FACULTY: "Giảng viên",
  ADMIN: "Admin",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Hoạt động",
  BANNED: "Đã khóa",
  PENDING_EMAIL: "Chưa xác thực email",
  PENDING_APPROVAL: "Chờ duyệt",
  REJECTED: "Bị từ chối",
  DELETED: "Đã xóa",
};

function UserManager() {
  const [form, setForm] = useState({ q: "", role: "", status: "" });
  const [filters, setFilters] = useState({ q: "", role: "", status: "" });
  const [page, setPage] = useState(0);
  const [data, setData] = useState<UserPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    params.set("page", String(page));
    params.set("size", "20");

    apiFetch<UserPage>(`/admin/users?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page, reloadKey]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setFilters(form);
  }

  function askReason(question: string): string | null {
    const reason = window.prompt(question);
    if (reason === null) return null;
    if (reason.trim().length < 5) {
      setError("Vui lòng nhập lý do (ít nhất 5 ký tự).");
      return null;
    }
    return reason.trim();
  }

  async function run(path: string, body?: object) {
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch<{ message: string }>(path, {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      });
      setSuccess(res.message);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  function lock(u: UserRow) {
    const reason = askReason(`Lý do khóa tài khoản ${u.email} (bắt buộc, sẽ gửi cho người dùng qua email):`);
    if (reason) run(`/admin/users/${u.id}/lock`, { reason });
  }

  function unlock(u: UserRow) {
    if (confirm(`Mở khóa tài khoản ${u.email}?`)) run(`/admin/users/${u.id}/unlock`);
  }

  function remove(u: UserRow) {
    const reason = askReason(`Lý do xóa tài khoản ${u.email} (bắt buộc, sẽ gửi cho người dùng qua email):`);
    if (!reason) return;
    if (!confirm("Xóa tài khoản này? Dữ liệu cá nhân bị xóa, các đánh giá môn học được giữ lại dưới dạng ẩn danh. Không thể hoàn tác.")) return;
    run(`/admin/users/${u.id}/delete`, { reason });
  }

    function graduate(u: UserRow) {
    const currentYear = new Date().getFullYear();
    const input = window.prompt(`Năm tốt nghiệp của ${u.fullName}:`, String(currentYear));
    if (input === null) return;
    const year = Number(input);
    if (!Number.isInteger(year) || year < 2006 || year > currentYear) {
      setError("Năm tốt nghiệp không hợp lệ.");
      return;
    }
    if (confirm(`Chuyển ${u.email} thành cựu sinh viên (tốt nghiệp ${year})?`)) {
      run(`/admin/graduation/users/${u.id}/graduate`, { graduationYear: year });
    }
  }
    function revertGraduation(u: UserRow) {
    const reason = askReason(
      `Lý do chuyển ${u.email} về sinh viên (bắt buộc, sẽ gửi cho người dùng qua email). Hồ sơ alumni, kể cả thông tin họ đã điền, sẽ bị xóa:`
    );
    if (reason) run(`/admin/graduation/users/${u.id}/revert`, { reason });
  }
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1 text-brand-darker">Quản lý người dùng</h1>
      <p className="text-sm text-ink-muted mb-6">
        Khóa tạm thời hoặc xóa tài khoản. Mọi thao tác đều ghi lại lý do và người thực hiện. Không thể khóa hoặc xóa tài
        khoản admin.
      </p>

      <form onSubmit={handleSearch} className="grid gap-2 sm:grid-cols-[1fr_10rem_12rem_auto] mb-6">
        <input
          className="input-field !mb-0"
          placeholder="Tìm theo tên hoặc email..."
          value={form.q}
          onChange={(e) => setForm({ ...form, q: e.target.value })}
        />
        <select className="input-field !mb-0" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="">Mọi vai trò</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="input-field !mb-0"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="">Mọi trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary">
          Tìm
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-700 text-sm mb-4">{success}</p>}
      {loading && !data && <p className="text-ink-muted text-sm">Đang tải...</p>}
      {data && data.content.length === 0 && <p className="text-ink-muted text-sm">Không có người dùng nào.</p>}

      <div className="space-y-2">
        {data?.content.map((u) => (
          <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{u.fullName}</p>
              <p className="text-sm text-ink-muted">{u.email}</p>
                            {u.role === "ALUMNI" && (
                <p className="text-xs text-ink-muted">
                  Email dự phòng:{" "}
                  {u.backupEmail
                    ? `${u.backupEmail} (${u.backupEmailVerified ? "đã xác thực" : "chưa xác thực"})`
                    : "chưa có"}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="badge">{ROLE_LABELS[u.role] ?? u.role}</span>
                <span className="badge">{STATUS_LABELS[u.status] ?? u.status}</span>
                {u.cohort && <span className="badge">{u.cohort}</span>}
              </div>
            </div>

            {u.role !== "ADMIN" && u.status !== "DELETED" && (
              <div className="flex gap-3 text-sm">
                {u.role === "STUDENT" && u.status === "ACTIVE" && (
                  <button onClick={() => graduate(u)} className="link-brand">
                    Chuyển thành alumni
                  </button>
                )}
                {u.role === "ALUMNI" && u.status === "ACTIVE" && u.convertedFromStudent && (
                  <button onClick={() => revertGraduation(u)} className="link-brand">
                    Chuyển lại sinh viên
                  </button>
                )}
                {u.status === "ACTIVE" && (
                  <button onClick={() => lock(u)} className="link-brand">
                    Khóa
                  </button>
                )}
                {u.status === "BANNED" && (
                  <button onClick={() => unlock(u)} className="link-brand">
                    Mở khóa
                  </button>
                )}
                <button onClick={() => remove(u)} className="text-red-600 hover:underline">
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex gap-2 pt-6 justify-center">
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
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UserManager />
    </AdminGuard>
  );
}