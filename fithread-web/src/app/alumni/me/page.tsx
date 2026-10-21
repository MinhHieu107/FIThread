"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { MyProfile } from "@/types/alumni";

function ProfileForm() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [form, setForm] = useState({
    company: "",
    positionTitle: "",
    industry: "",
    bio: "",
    linkedinUrl: "",
    contactVisible: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<string[]>("/alumni/industries").then(setIndustries).catch(() => setIndustries([]));
    apiFetch<MyProfile>("/alumni/me")
      .then((p) => {
        setProfile(p);
        setForm({
          company: p.company ?? "",
          positionTitle: p.positionTitle ?? "",
          industry: p.industry ?? "",
          bio: p.bio ?? "",
          linkedinUrl: p.linkedinUrl ?? "",
          contactVisible: p.contactVisible,
        });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const updated = await apiFetch<MyProfile>("/alumni/me", { method: "PUT", body: JSON.stringify(form) });
      setProfile(updated);
      setSuccess("Đã lưu hồ sơ.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <main className="max-w-xl mx-auto px-4 py-12">
        {error ? <p className="text-red-600">{error}</p> : "Đang tải..."}
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1 text-brand-darker">Hồ sơ của tôi</h1>
      <p className="text-sm text-ink-muted mb-6">
        {profile.fullName} · {profile.cohort} · Tốt nghiệp {profile.graduationYear}
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <input
          className="input-field"
          placeholder="Công ty hiện tại"
          maxLength={255}
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Vị trí công việc"
          maxLength={255}
          value={form.positionTitle}
          onChange={(e) => setForm({ ...form, positionTitle: e.target.value })}
        />
        <select
          className="input-field"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
        >
          <option value="">-- Ngành nghề --</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <textarea
          className="input-field"
          rows={4}
          maxLength={1000}
          placeholder="Giới thiệu ngắn về bạn..."
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Đường dẫn LinkedIn (bắt đầu bằng https://)"
          maxLength={255}
          value={form.linkedinUrl}
          onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
        />

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.contactVisible}
            onChange={(e) => setForm({ ...form, contactVisible: e.target.checked })}
          />
          <span>
            Hiển thị LinkedIn và email ({profile.email}) cho những người đã đăng nhập FIThread. Bỏ chọn nếu bạn muốn
            giữ riêng tư.
          </span>
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-700 text-sm">{success}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Đang lưu..." : "Lưu hồ sơ"}
        </button>
      </form>
    </main>
  );
}

export default function MyAlumniProfilePage() {
  return (
    <RoleGuard roles={["ALUMNI"]}>
      <ProfileForm />
    </RoleGuard>
  );
}