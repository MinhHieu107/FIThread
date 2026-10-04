"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { Course, PageResponse, OfferingResponse } from "@/types/course";

function OfferingForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [lecturerName, setLecturerName] = useState("");
  const [semester, setSemester] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<PageResponse<Course>>("/courses?size=200").then((res) => setCourses(res.content));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch<OfferingResponse>("/admin/offerings", {
        method: "POST",
        body: JSON.stringify({ courseId, lecturerName, semester }),
      });
      setSuccess("Đã tạo lần mở lớp thành công.");
      setLecturerName("");
      setSemester("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Thêm lần mở lớp (giảng viên + học kỳ)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={courseId}
          onChange={(e) => setCourseId(Number(e.target.value))}
        >
          <option value="">-- Chọn môn học --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tên giảng viên"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={lecturerName}
          onChange={(e) => setLecturerName(e.target.value)}
        />

        <select
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">-- Chọn học kỳ --</option>
          <option value="HK1">Học kỳ 1</option>
          <option value="HK2">Học kỳ 2</option>
        </select>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand-dark text-white rounded-md px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Thêm"}
        </button>
      </form>
    </main>
  );
}

export default function AdminOfferingsPage() {
  return (
    <AdminGuard>
      <OfferingForm />
    </AdminGuard>
  );
}