"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiFetch, ApiError } from "@/lib/api";
import { Course, PageResponse, OfferingResponse } from "@/types/course";

function OfferingManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [offerings, setOfferings] = useState<OfferingResponse[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [lecturerName, setLecturerName] = useState("");
  const [semester, setSemester] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function loadOfferings() {
    apiFetch<OfferingResponse[]>("/admin/offerings").then(setOfferings);
  }

  useEffect(() => {
    apiFetch<PageResponse<Course>>("/courses?size=200").then((res) => setCourses(res.content));
    loadOfferings();
  }, []);

  function resetForm() {
    setCourseId("");
    setLecturerName("");
    setSemester("");
    setEditingId(null);
  }

  function startEdit(o: OfferingResponse) {
    setEditingId(o.id);
    setCourseId(o.courseId);
    setLecturerName(o.lecturerName);
    setSemester(o.semester);
    setSuccess("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = JSON.stringify({ courseId, lecturerName, semester });

      if (editingId) {
        await apiFetch<OfferingResponse>(`/admin/offerings/${editingId}`, { method: "PUT", body });
        setSuccess("Đã cập nhật.");
      } else {
        await apiFetch<OfferingResponse>("/admin/offerings", { method: "POST", body });
        setSuccess("Đã tạo lần mở lớp thành công.");
      }

      resetForm();
      loadOfferings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xóa lần mở lớp này?")) return;

    setError("");
    try {
      await apiFetch(`/admin/offerings/${id}`, { method: "DELETE" });
      loadOfferings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">
        {editingId ? "Sửa lần mở lớp" : "Thêm lần mở lớp"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <select
          required
          className="input-field"
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
          className="input-field"
          value={lecturerName}
          onChange={(e) => setLecturerName(e.target.value)}
        />

        <select
          required
          className="input-field"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">-- Chọn học kỳ --</option>
          <option value="HK1">Học kỳ 1</option>
          <option value="HK2">Học kỳ 2</option>
        </select>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand hover:bg-brand-dark text-white rounded-md px-4 py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-300 rounded-md px-4 py-2 font-medium"
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <h2 className="font-semibold mb-3">Danh sách lần mở lớp</h2>
      {offerings.length === 0 ? (
        <p className="text-ink-muted text-sm">Chưa có lần mở lớp nào.</p>
      ) : (
        <div className="space-y-2">
          {offerings.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between border border-gray-200 rounded-md p-3 bg-white"
            >
              <div>
                <span className="text-sm text-ink-muted">{o.courseCode}</span>
                <p className="font-medium">
                  {o.courseName} — {o.lecturerName} — {o.semester}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(o)}
                  className="text-sm text-brand-dark hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(o.id)}
                  className="text-sm text-red-600 hover:underline"
                >
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

export default function AdminOfferingsPage() {
  return (
    <AdminGuard>
      <OfferingManager />
    </AdminGuard>
  );
}
