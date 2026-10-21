"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackupEmailVerifier from "@/components/BackupEmailVerifier";
import { apiFetch, ApiError, clearTokens } from "@/lib/api";
import { CurrentUser, getCurrentUser } from "@/lib/auth";
import { BackupEmailStatus, GraduationRequestView } from "@/types/account";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Sinh viên",
  ALUMNI: "Cựu sinh viên",
  FACULTY: "Giảng viên",
  ADMIN: "Admin",
};

function notifyAuthChanged() {
  window.dispatchEvent(new Event("fithread-auth-changed"));
}

function GraduationSection() {
  const currentYear = new Date().getFullYear();
  const [request, setRequest] = useState<GraduationRequestView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [year, setYear] = useState(String(currentYear));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    apiFetch<GraduationRequestView | null>("/account/graduation")
      .then(setRequest)
      .catch(() => setRequest(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/account/graduation-request", {
        method: "POST",
        body: JSON.stringify({ graduationYear: Number(year) }),
      });
      setOpen(false);
      setVerifiedEmail(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return null;

  const pending = request?.status === "PENDING";

  return (
    <section className="card space-y-3">
      <h2 className="font-semibold">Tình trạng học tập</h2>

      {pending ? (
        <p className="text-sm">
          Bạn đã gửi yêu cầu xác nhận <strong>đã tốt nghiệp năm {request?.graduationYear}</strong>. Yêu cầu đang chờ
          admin duyệt, kết quả sẽ được gửi qua email.
        </p>
      ) : (
        <>
          <p className="text-sm">
            Hiện tại: <strong>Đang học</strong>
          </p>
          {request?.status === "REJECTED" && (
            <p className="text-sm text-red-600">
              Yêu cầu tốt nghiệp gần nhất chưa được duyệt{request.reason ? `: ${request.reason}` : ""}.
            </p>
          )}

          {!open ? (
            <button onClick={() => setOpen(true)} className="btn-secondary">
              Tôi đã tốt nghiệp
            </button>
          ) : (
            <div className="space-y-4 rounded-md bg-brand-lighter p-3">
              <div>
                <p className="text-sm font-medium mb-1">Bước 1: xác thực email cá nhân dự phòng</p>
                <p className="text-xs text-ink-muted mb-2">
                  Dùng để khoa liên lạc lại nếu email trường bị thu hồi. Email này chỉ quản trị viên nhìn thấy.
                </p>
                {verifiedEmail ? (
                  <p className="text-sm text-green-700">
                    Đã xác thực: {verifiedEmail}{" "}
                    <button type="button" onClick={() => setVerifiedEmail(null)} className="link-brand text-xs">
                      Xác thực lại
                    </button>
                  </p>
                ) : (
                  <BackupEmailVerifier confirmLabel="Xác nhận" onVerified={(email) => setVerifiedEmail(email)} />
                )}
              </div>

              <form onSubmit={submit} className="space-y-2">
                <p className="text-sm font-medium">Bước 2: năm tốt nghiệp</p>
                <input
                  type="number"
                  className="input-field"
                  min={2006}
                  max={currentYear}
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={loading || !verifiedEmail} className="btn-primary">
                    {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function BackupEmailSection() {
  const [status, setStatus] = useState<BackupEmailStatus | null>(null);
  const [success, setSuccess] = useState("");

  const load = useCallback(() => {
    apiFetch<BackupEmailStatus>("/account/backup-email")
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!status) return null;

  const mustComplete = status.required && !status.verified;

  return (
    <section className="card space-y-3">
      <h2 className="font-semibold">Email dự phòng</h2>
      <p className="text-xs text-ink-muted">
        Email cá nhân để khoa liên lạc lại nếu email trường bị thu hồi. Chỉ quản trị viên nhìn thấy, không hiển thị công
        khai.
      </p>

      {mustComplete && (
        <p className="rounded-md bg-brand-light px-3 py-2 text-sm">
          Bạn cần bổ sung email dự phòng để hoàn tất hồ sơ và xuất hiện trong danh bạ cựu sinh viên.
        </p>
      )}

      <p className="text-sm">
        Hiện tại:{" "}
        {status.email ? (
          <strong>
            {status.email} ({status.verified ? "đã xác thực" : "chưa xác thực"})
          </strong>
        ) : (
          <span className="text-ink-muted">chưa có</span>
        )}
      </p>

      <BackupEmailVerifier
        confirmLabel="Xác nhận và lưu"
        onVerified={() => {
          setSuccess("Đã lưu email dự phòng.");
          load();
          notifyAuthChanged(); // làm mới thanh nhắc ở đầu trang
        }}
      />
      {success && <p className="text-green-700 text-sm">{success}</p>}
    </section>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) router.push("/login");
      else setUser(u);
    });
  }, [router]);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !confirm(
        "Xóa tài khoản? Dữ liệu cá nhân, hồ sơ và lịch sử chatbot của bạn sẽ bị xóa. Các đánh giá môn học đã gửi được giữ lại dưới dạng ẩn danh. Không thể hoàn tác."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/account/delete", { method: "POST", body: JSON.stringify({ password }) });
      clearTokens();
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <main className="max-w-xl mx-auto px-4 py-12">Đang tải...</main>;

  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-2xl font-bold text-brand-darker">Tài khoản của tôi</h1>

      <section className="card space-y-1">
        <p className="font-medium">{user.fullName}</p>
        <p className="text-sm text-ink-muted">{user.email}</p>
        <span className="badge mt-1">{ROLE_LABELS[user.role] ?? user.role}</span>
      </section>

      {user.role === "STUDENT" && <GraduationSection />}
      {user.role === "ALUMNI" && <BackupEmailSection />}

      {user.role !== "ADMIN" && (
        <section className="card space-y-3 border-red-200">
          <h2 className="font-semibold text-red-700">Xóa tài khoản</h2>
          <p className="text-sm text-ink-muted">
            Dữ liệu cá nhân, hồ sơ và lịch sử chatbot sẽ bị xóa. Các đánh giá môn học bạn đã gửi vẫn được giữ lại dưới
            dạng ẩn danh để thống kê của môn học không bị thay đổi. Bạn nhập mật khẩu để xác nhận.
          </p>
          <form onSubmit={handleDelete} className="space-y-3">
            <input
              type="password"
              className="input-field"
              placeholder="Mật khẩu hiện tại"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Đang xóa..." : "Xóa tài khoản của tôi"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}