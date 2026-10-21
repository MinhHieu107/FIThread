"use client";

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { BatchRow, CohortCount, GraduationRequestRow, StudentRow } from "@/types/account";

function GraduationManager() {
  const currentYear = new Date().getFullYear();

  const [requests, setRequests] = useState<GraduationRequestRow[]>([]);
  const [cohorts, setCohorts] = useState<CohortCount[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [cohort, setCohort] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [year, setYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch<GraduationRequestRow[]>("/admin/graduation/requests"),
      apiFetch<CohortCount[]>("/admin/graduation/cohorts"),
      apiFetch<BatchRow[]>("/admin/graduation/batches"),
    ])
      .then(([r, c, b]) => {
        setRequests(r);
        setCohorts(c);
        setBatches(b);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(path: string, body?: object): Promise<boolean> {
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch<{ message: string }>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
      setSuccess(res.message);
      load();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      return false;
    }
  }

  // ----- yêu cầu của sinh viên -----

  function approve(r: GraduationRequestRow) {
    if (confirm(`Duyệt ${r.fullName} đã tốt nghiệp năm ${r.graduationYear}?`)) {
      run(`/admin/graduation/requests/${r.id}/approve`);
    }
  }

  function reject(r: GraduationRequestRow) {
    const reason = window.prompt("Lý do từ chối (bắt buộc, sẽ gửi cho sinh viên qua email):");
    if (reason === null) return;
    if (reason.trim().length < 5) {
      setError("Vui lòng nhập lý do (ít nhất 5 ký tự).");
      return;
    }
    run(`/admin/graduation/requests/${r.id}/reject`, { reason: reason.trim() });
  }

  // ----- chuyển theo khóa, có chọn từng người -----

  function handleCohortChange(value: string) {
    setCohort(value);
    setStudents([]);
    setSelected(new Set());
    if (!value) return;

    apiFetch<StudentRow[]>(`/admin/graduation/cohort-students?cohort=${encodeURIComponent(value)}`)
      .then((list) => {
        setStudents(list);
        setSelected(new Set(list.map((s) => s.id))); // mặc định chọn tất cả, admin bỏ tick người chưa ra trường
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function convertSelected(e: React.FormEvent) {
    e.preventDefault();
    const y = Number(year);

    if (!cohort || selected.size === 0) {
      setError("Vui lòng chọn khóa và ít nhất một sinh viên.");
      return;
    }
    if (!Number.isInteger(y) || y < 2006 || y > currentYear) {
      setError("Năm tốt nghiệp không hợp lệ.");
      return;
    }

    const unchecked = students.length - selected.size;
    const note = unchecked > 0 ? ` ${unchecked} sinh viên không được chọn sẽ giữ nguyên.` : "";
    if (
      !confirm(
        `Chuyển ${selected.size} sinh viên khóa ${cohort} thành cựu sinh viên (tốt nghiệp ${y})?${note} Mỗi người được chọn sẽ nhận email nhắc bổ sung email dự phòng. Có thể hoàn tác ở mục "Đợt chuyển gần đây".`
      )
    ) {
      return;
    }

    const ok = await run("/admin/graduation/cohorts/graduate", {
      cohort,
      graduationYear: y,
      userIds: Array.from(selected),
    });
    if (ok) {
      setCohort("");
      setStudents([]);
      setSelected(new Set());
    }
  }

  // ----- hoàn tác cả đợt -----

  function revertBatch(b: BatchRow) {
    const warn =
      b.filled > 0
        ? `\n\nLưu ý: ${b.filled} người trong đợt đã bổ sung thông tin hồ sơ, hoàn tác sẽ XÓA các thông tin đó.`
        : "";
    const reason = window.prompt(
      `Hoàn tác đợt chuyển khóa ${b.cohort} (${b.remaining} người còn là cựu sinh viên) về sinh viên?${warn}\n\nNhập lý do (bắt buộc, sẽ gửi cho từng người qua email):`
    );
    if (reason === null) return;
    if (reason.trim().length < 5) {
      setError("Vui lòng nhập lý do (ít nhất 5 ký tự).");
      return;
    }
    run(`/admin/graduation/batches/${b.id}/revert`, { reason: reason.trim() });
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1 text-brand-darker">Tốt nghiệp và chuyển alumni</h1>
        <p className="text-sm text-ink-muted">
          Chuyển từng người ở trang Người dùng, chuyển theo khóa ở đây, hoặc duyệt yêu cầu do sinh viên tự gửi.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-700 text-sm">{success}</p>}

      <section>
        <h2 className="font-semibold mb-3">Yêu cầu tốt nghiệp chờ duyệt</h2>
        {loading && <p className="text-ink-muted text-sm">Đang tải...</p>}
        {!loading && requests.length === 0 && <p className="text-ink-muted text-sm">Không có yêu cầu nào.</p>}
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{r.fullName}</p>
                <p className="text-sm text-ink-muted">{r.email}</p>
                <p className="text-sm text-ink-muted">
                  {r.cohort ? `${r.cohort} · ` : ""}Tốt nghiệp {r.graduationYear} · Email dự phòng (đã xác thực):{" "}
                  {r.backupEmail}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(r)} className="btn-primary">
                  Duyệt
                </button>
                <button onClick={() => reject(r)} className="btn-secondary">
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Chuyển sinh viên theo khóa</h2>
        <p className="text-xs text-ink-muted">
          Chọn khóa, bỏ tick những bạn chưa ra trường rồi chuyển. Chỉ gồm sinh viên đang hoạt động đã điền khóa khi đăng
          ký, sinh viên không có khóa thì chuyển riêng từng người.
        </p>

        {cohorts.length === 0 ? (
          <p className="text-sm text-ink-muted">Chưa có khóa nào.</p>
        ) : (
          <form onSubmit={convertSelected} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
              <select className="input-field !mb-0" value={cohort} onChange={(e) => handleCohortChange(e.target.value)}>
                <option value="">-- Chọn khóa --</option>
                {cohorts.map((c) => (
                  <option key={c.cohort} value={c.cohort}>
                    {c.cohort} ({c.count} sinh viên)
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="input-field !mb-0"
                min={2006}
                max={currentYear}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                aria-label="Năm tốt nghiệp"
              />
            </div>

            {students.length > 0 && (
              <div className="rounded-md bg-brand-lighter p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    Đã chọn {selected.size}/{students.length}
                  </span>
                  <span className="flex gap-3">
                    <button
                      type="button"
                      className="link-brand"
                      onClick={() => setSelected(new Set(students.map((s) => s.id)))}
                    >
                      Chọn tất cả
                    </button>
                    <button type="button" className="link-brand" onClick={() => setSelected(new Set())}>
                      Bỏ chọn tất cả
                    </button>
                  </span>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {students.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-white">
                      <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                      <span className="font-medium">{s.fullName}</span>
                      <span className="text-ink-muted">{s.email}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={selected.size === 0} className="btn-primary">
              Chuyển {selected.size > 0 ? `${selected.size} người đã chọn` : ""}
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-1">Đợt chuyển gần đây</h2>
        <p className="text-xs text-ink-muted mb-3">
          Mỗi lần chuyển theo khóa là một đợt. Hoàn tác đưa tất cả người của đợt (vẫn còn là cựu sinh viên) về sinh viên
          và xóa hồ sơ alumni của họ.
        </p>

        {batches.length === 0 ? (
          <p className="text-sm text-ink-muted">Chưa có đợt chuyển nào.</p>
        ) : (
          <div className="space-y-2">
            {batches.map((b) => (
              <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">
                    Khóa {b.cohort} · tốt nghiệp {b.graduationYear} · {b.studentCount} người
                  </p>
                  <p className="text-xs text-ink-muted">
                    {new Date(b.createdAt).toLocaleString("vi-VN")} · bởi {b.createdByName}
                  </p>
                  {b.reverted ? (
                    <p className="text-sm text-ink-muted">
                      Đã hoàn tác lúc {b.revertedAt ? new Date(b.revertedAt).toLocaleString("vi-VN") : ""}.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm">Còn {b.remaining} người đang là cựu sinh viên trong đợt này.</p>
                      {b.filled > 0 && (
                        <p className="text-sm text-red-600">
                          Lưu ý: {b.filled} người đã bổ sung thông tin hồ sơ, hoàn tác sẽ xóa các thông tin đó.
                        </p>
                      )}
                    </>
                  )}
                </div>
                {!b.reverted && (
                  <button onClick={() => revertBatch(b)} disabled={b.remaining === 0} className="btn-secondary">
                    Hoàn tác đợt này
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function AdminGraduationPage() {
  return (
    <AdminGuard>
      <GraduationManager />
    </AdminGuard>
  );
}