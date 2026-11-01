"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { TimelineEvent } from "@/types/timeline";

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<TimelineEvent[]>("/timeline")
      .then(setEvents)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra"));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<number, TimelineEvent[]>();
    (events ?? []).forEach((e) => {
      const list = map.get(e.year) ?? [];
      list.push(e);
      map.set(e.year, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [events]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 text-brand-darker">Hành trình 20 năm FIT</h1>
      <p className="text-ink-muted mb-10">
        Khoa Công nghệ Thông tin – Trường Đại học Hà Nội, 2006 – 2026.
      </p>

      {error && <p className="text-red-600">{error}</p>}
      {!events && !error && <p className="text-ink-muted">Đang tải...</p>}
      {events && events.length === 0 && (
        <p className="text-ink-muted">Dòng thời gian đang được cập nhật.</p>
      )}

      <ol className="relative ml-3 space-y-10 border-l-2 border-brand">
        {groups.map(([year, items]) => (
          <li key={year} className="relative ml-6">
            <span className="absolute -left-[2.15rem] top-1 h-5 w-5 rounded-full border-4 border-white bg-brand-dark" />
            <h2 className="mb-3 text-2xl font-bold text-brand-darker">{year}</h2>
            <div className="space-y-3">
              {items.map((e) => (
                <div key={e.id} className="card">
                  <p className="font-medium">{e.title}</p>
                  {e.description && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">{e.description}</p>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}