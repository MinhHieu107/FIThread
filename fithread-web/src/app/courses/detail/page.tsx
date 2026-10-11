"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError, isLoggedIn } from "@/lib/api";
import { CurrentUser, getCurrentUser } from "@/lib/auth";
import { Course, OfferingResponse } from "@/types/course";
import { Review, RubricCriterion } from "@/types/review";
import CourseStatsPanel from "@/components/CourseStatsPanel";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";

function CourseDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const courseId = id ? Number(id) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [offerings, setOfferings] = useState<OfferingResponse[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | "">("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const canReview = user?.role === "STUDENT" || user?.role === "ALUMNI";

  // Thông tin môn học + các lần mở lớp (công khai)
  useEffect(() => {
    if (!courseId) {
      setError("Thiếu mã môn học");
      setLoading(false);
      return;
    }

    Promise.all([
      apiFetch<Course>(`/courses/${courseId}`),
      apiFetch<OfferingResponse[]>(`/courses/${courseId}/offerings`),
    ])
      .then(([courseRes, offeringsRes]) => {
        setCourse(courseRes);
        setOfferings(offeringsRes);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"))
      .finally(() => setLoading(false));
  }, [courseId]);

  // Người dùng hiện tại (để biết có được viết đánh giá không)
  useEffect(() => {
    if (!isLoggedIn()) {
      setAuthChecked(true);
      return;
    }
    getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  // Danh sách tiêu chí (chỉ cần khi được phép đánh giá)
  useEffect(() => {
    if (!canReview) return;
    apiFetch<RubricCriterion[]>("/rubric")
      .then(setCriteria)
      .catch(() => setCriteria([]));
  }, [canReview]);

  // Đánh giá của chính mình cho môn này
  useEffect(() => {
    if (!canReview || !courseId) return;
    apiFetch<Review[]>(`/courses/${courseId}/my-reviews`)
      .then(setMyReviews)
      .catch(() => setMyReviews([]));
  }, [canReview, courseId, refreshKey]);

  function handleChanged() {
    setRefreshKey((k) => k + 1);
  }

  function handleEdit(offeringId: number) {
    setSelectedOfferingId(offeringId);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) return <main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>;
  if (error) return <main className="max-w-3xl mx-auto px-4 py-12 text-red-600">{error}</main>;
  if (!course || !courseId) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <section>
        <span className="text-ink-muted">{course.code}</span>
        <h1 className="text-2xl font-bold mb-2 text-brand-darker">{course.name}</h1>
        <div className="flex gap-2 mb-4">
          <span className="badge">{course.credits} tín chỉ</span>
          {course.specialization && <span className="badge">{course.specialization}</span>}
          {course.required && <span className="badge">Môn bắt buộc</span>}
        </div>
        {course.description && <p className="mb-4">{course.description}</p>}

        <h2 className="font-semibold mb-3">Các lần mở lớp</h2>
        {offerings.length === 0 ? (
          <p className="text-ink-muted text-sm">Chưa có dữ liệu giảng viên/học kỳ cho môn này.</p>
        ) : (
          <ul className="space-y-2">
            {offerings.map((o) => (
              <li key={o.id} className="card">
                {o.lecturerName} — {o.semester}
              </li>
            ))}
          </ul>
        )}
      </section>

      {authChecked && !user && (
        <div className="card text-sm">
          Hãy{" "}
          <Link href="/login" className="link-brand">
            đăng nhập
          </Link>{" "}
          để xem và viết đánh giá môn học.
        </div>
      )}

      {user && (
        <>
          <section>
            <h2 className="font-semibold mb-3">Thống kê đánh giá</h2>
            <CourseStatsPanel courseId={courseId} refreshKey={refreshKey} />
          </section>

          {canReview && (
            <div ref={formRef}>
              {offerings.length === 0 ? (
                <div className="card text-sm text-ink-muted">
                  Môn này chưa có thông tin giảng viên/học kỳ nên chưa thể đánh giá.
                </div>
              ) : (
                <ReviewForm
                  offerings={offerings}
                  criteria={criteria}
                  myReviews={myReviews}
                  selectedOfferingId={selectedOfferingId}
                  onSelectOffering={setSelectedOfferingId}
                  onChanged={handleChanged}
                />
              )}
            </div>
          )}

          <section>
            <h2 className="font-semibold mb-3">Đánh giá từ sinh viên</h2>
            <ReviewList
              courseId={courseId}
              refreshKey={refreshKey}
              onEdit={handleEdit}
              onChanged={handleChanged}
            />
          </section>
        </>
      )}
    </main>
  );
}

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>}>
      <CourseDetail />
    </Suspense>
  );
}