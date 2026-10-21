"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
const MAX_PHOTO = 5 * 1024 * 1024;

export default function RegisterAlumniPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({ email: "", fullName: "", password: "", cohort: "", graduationYear: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!photo) {
      setError("Vui lòng tải lên ảnh thẻ sinh viên cũ.");
      return;
    }
    if (photo.size > MAX_PHOTO) {
      setError("Ảnh tối đa 5MB.");
      return;
    }
    if (!consent) {
      setError("Vui lòng đồng ý hiển thị hồ sơ cho người dùng trong hệ thống.");
      return;
    }

    const data = new FormData();
    data.append("email", form.email);
    data.append("fullName", form.fullName);
    data.append("password", form.password);
    data.append("cohort", form.cohort);
    data.append("graduationYear", form.graduationYear);
    data.append("consent", String(consent));
    data.append("photo", photo);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register-alumni`, { method: "POST", body: data });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Có lỗi xảy ra" }));
        throw new Error(body.message || "Có lỗi xảy ra");
      }
      router.push(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2 text-brand-darker">Đăng ký cựu sinh viên</h1>
      <p className="text-sm text-ink-muted mb-6">
        Dùng email cá nhân của bạn. Hồ sơ sẽ được admin duyệt dựa trên ảnh thẻ sinh viên cũ, ảnh được xóa ngay sau khi
        duyệt hoặc từ chối.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email cá nhân"
          required
          className="input-field"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Họ và tên"
          required
          className="input-field"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu (8 đến 72 ký tự)"
          required
          minLength={8}
          maxLength={72}
          className="input-field"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          type="text"
          placeholder="Khóa (ví dụ K12)"
          required
          maxLength={20}
          className="input-field"
          value={form.cohort}
          onChange={(e) => setForm({ ...form, cohort: e.target.value })}
        />
        <input
          type="number"
          placeholder="Năm tốt nghiệp"
          required
          min={2006}
          max={currentYear}
          className="input-field"
          value={form.graduationYear}
          onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
        />

        <div>
          <label className="block text-sm mb-1">Ảnh thẻ sinh viên cũ (JPG, PNG hoặc WEBP, tối đa 5MB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="block w-full text-sm"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Tôi đồng ý hiển thị hồ sơ (họ tên, khóa, năm tốt nghiệp và thông tin công việc tôi điền) cho những người đã
            đăng nhập FIThread. Thông tin liên hệ chỉ hiện khi tôi tự bật.
          </span>
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="text-sm text-ink-muted text-center">
          Bạn là sinh viên đang học?{" "}
          <Link href="/register" className="link-brand">
            Đăng ký tài khoản sinh viên
          </Link>
        </p>
      </form>
    </main>
  );
}