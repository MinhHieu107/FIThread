"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { Course, OfferingResponse } from "@/types/course";

function CourseDetail() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [course, setCourse] = useState<Course | null>(null);
    const [offerings, setOfferings] = useState<OfferingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) {
            setError("Thiếu mã môn học");
            setLoading(false);
            return;
        }

        Promise.all([
            apiFetch<Course>(`/courses/${id}`),
            apiFetch<OfferingResponse[]>(`/courses/${id}/offerings`),
        ])
            .then(([courseRes, offeringsRes]) => {
                setCourse(courseRes);
                setOfferings(offeringsRes);
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>;
    if (error) return <main className="max-w-3xl mx-auto px-4 py-12 text-red-600">{error}</main>;
    if (!course) return null;

    return (
        <main className="max-w-3xl mx-auto px-4 py-12">
            <span className="text-gray-500">{course.code}</span>
            <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
            <div className="flex gap-3 mb-6">
                <span className="text-sm bg-brand-light text-brand-dark rounded px-2 py-0.5">
                    {course.credits} tín chỉ
                </span>
                {course.specialization && (
                    <span className="text-sm bg-gray-100 text-gray-700 rounded px-2 py-0.5">
                        {course.specialization}
                    </span>
                )}
                {course.required && (
                    <span className="text-sm bg-gray-100 text-gray-700 rounded px-2 py-0.5">
                        Môn bắt buộc
                    </span>
                )}
            </div>

            {course.description && <p className="text-gray-700 mb-8">{course.description}</p>}

            <h2 className="font-semibold mb-3">Các lần mở lớp</h2>
            {offerings.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có dữ liệu giảng viên/học kỳ cho môn này.</p>
            ) : (
                <ul className="space-y-2">
                    {offerings.map((o) => (
                        <li key={o.id} className="border border-gray-200 rounded-md p-3 bg-white">
                            {o.lecturerName} — {o.semester}
                        </li>
                    ))}
                </ul>
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