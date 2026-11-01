"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PostCard from "@/components/forum/PostCard";
import { apiFetch, ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { PostView, ThreadView } from "@/types/forum";

function Thread() {
  const router = useRouter();
  const id = useSearchParams().get("id");

  const [data, setData] = useState<ThreadView | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    getCurrentUser().then((u) => setIsAdmin(u?.role === "ADMIN"));
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    apiFetch<ThreadView>(`/forum/posts/${id}`)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) router.push("/forum"); // bài vừa bị xóa
        else setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey, router]);

  const children = useMemo(() => {
    const map = new Map<number, PostView[]>();
    (data?.replies ?? []).forEach((r) => {
      const key = r.parentId as number;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    });
    return map;
  }, [data]);

  function renderChildren(parentId: number, depth: number): React.ReactNode {
    const list = children.get(parentId);
    if (!list) return null;

    return list.map((r) => (
      <div key={r.id} className={depth < 4 ? "mt-3 ml-4 border-l-2 border-brand-light pl-3" : "mt-3"}>
        <PostCard post={r} mode="thread" isAdmin={isAdmin} onChanged={reload} />
        {renderChildren(r.id, depth + 1)}
      </div>
    ));
  }

  if (!id) return <main className="max-w-3xl mx-auto px-4 py-12 text-red-600">Thiếu mã bài viết</main>;
  if (error) return <main className="max-w-3xl mx-auto px-4 py-12 text-red-600">{error}</main>;
  if (!data) return <main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <Link href="/forum" className="link-brand text-sm">
        ← Diễn đàn
      </Link>

      <PostCard post={data.root} mode="thread" isAdmin={isAdmin} onChanged={reload} />

      <div>
        {data.replies.length === 0 && data.root.status === "PUBLISHED" && (
          <p className="text-sm text-ink-muted">Chưa có trả lời nào, hãy là người đầu tiên.</p>
        )}
        {renderChildren(data.root.id, 0)}
      </div>
    </main>
  );
}

export default function ForumThreadPage() {
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>}>
      <Thread />
    </Suspense>
  );
}