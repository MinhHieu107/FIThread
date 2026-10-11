"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { CourseStats } from "@/types/review";
import { StarDisplay } from "./StarRating";

export default function CourseStatsPanel({ courseId, refreshKey }: { courseId: number; refreshKey: number }) {
  const [stats, setStats] = useState<CourseStats | null>(null);

  useEffect(() => {
    apiFetch<CourseStats>(`/courses/${courseId}/stats`)
      .then(setStats)
      .catch(() => setStats(null));
  }, [courseId, refreshKey]);

  if (!stats) return null;

  if (stats.hidden) {
    return (
      <div className="card text-sm text-ink-muted">
        Cần ít nhất {stats.minRequired} đánh giá để hiển thị thống kê (hiện có {stats.reviewCount}).
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-brand-darker">{stats.overallAverage?.toFixed(1)}</span>
          <span className="text-sm text-ink-muted">/ 5 · {stats.reviewCount} đánh giá</span>
        </div>
        {stats.overallAverage !== null && <StarDisplay value={stats.overallAverage} />}
      </div>

      <div className="space-y-3">
        {stats.criteria.map((c) => (
          <div key={c.criterionId}>
            <div className="flex justify-between text-sm mb-1">
              <span>{c.name}</span>
              <span className="text-ink-muted">{c.average.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded bg-brand-light">
              <div className="h-2 rounded bg-brand-dark" style={{ width: `${(c.average / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}