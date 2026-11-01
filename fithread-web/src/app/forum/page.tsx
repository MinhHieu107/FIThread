"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Composer from "@/components/forum/Composer";
import PostCard from "@/components/forum/PostCard";
import { apiFetch, ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { PostPage, TagCount, FeaturedThread } from "@/types/forum";

function Feed() {
  const router = useRouter();
  const params = useSearchParams();
  const tag = params.get("tag") ?? "";
  const q = params.get("q") ?? "";

  const [mine, setMine] = useState(false);
  const [pageState, setPageState] = useState({ key: "", page: 0 });
  const [data, setData] = useState<PostPage | null>(null);
  const [trending, setTrending] = useState<TagCount[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [featuredThreads, setFeaturedThreads] = useState<FeaturedThread[]>([]);
  const filterKey = `${tag}|${q}|${mine}`;
  const page = pageState.key === filterKey ? pageState.page : 0;
  useEffect(() => {
    getCurrentUser().then((u) => setIsAdmin(u?.role === "ADMIN"));
  }, []);

  useEffect(() => {
    apiFetch<TagCount[]>("/forum/tags/trending")
      .then(setTrending)
      .catch(() => setTrending([]));
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;

    const query = new URLSearchParams();
    if (tag) query.set("tag", tag);
    if (q) query.set("q", q);
    if (mine) query.set("mine", "true");
    query.set("page", String(page));
    query.set("size", "15");

    apiFetch<PostPage>(`/forum/posts?${query.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      });

    return () => {
      cancelled = true;
    };
  }, [tag, q, mine, page, reloadKey]);
  useEffect(() => {
  if (mine || tag || q) {
    setFeaturedThreads([]);
    return;
  }

  apiFetch<FeaturedThread[]>("/forum/posts/featured?size=5")
    .then(setFeaturedThreads)
    .catch(() => setFeaturedThreads([]));
}, [mine, tag, q, reloadKey]);
  async function createPost(content: string) {
    await apiFetch("/forum/posts", { method: "POST", body: JSON.stringify({ content }) });
    setReloadKey((k) => k + 1);
  }

  const filtered = !!tag || !!q;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-darker">Diễn đàn FIThread</h1>
        <p className="text-sm text-ink-muted">Nơi sinh viên, cựu sinh viên và thầy cô trò chuyện, chia sẻ và hỏi đáp.</p>
      </div>

      <section className="card">
        <Composer
          placeholder="Bạn đang nghĩ gì? Gõ #chude để gắn chủ đề..."
          submitLabel="Đăng"
          tagHint
          onSubmit={createPost}
        />
      </section>

      <form
        key={q}
        onSubmit={(e) => {
          e.preventDefault();
          const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
          router.push(value ? `/forum?q=${encodeURIComponent(value)}` : "/forum");
        }}
        className="flex gap-2"
      >
        <input name="q" defaultValue={q} className="input-field !mb-0" placeholder="Tìm bài viết..." />
        <button type="submit" className="btn-primary">
          Tìm
        </button>
      </form>

      {trending.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-muted">Chủ đề nổi bật:</span>
          {trending.map((t) => (
            <Link
              key={t.tag}
              href={`/forum?tag=${encodeURIComponent(t.tag)}`}
              className={tag === t.tag ? "badge !bg-brand-dark !text-white" : "badge hover:bg-brand"}
            >
              #{t.tag} · {t.count}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setMine(false)} className={!mine ? "btn-primary" : "btn-secondary"}>
          Mới nhất
        </button>
        <button onClick={() => setMine(true)} className={mine ? "btn-primary" : "btn-secondary"}>
          Bài của tôi
        </button>
        {filtered && !mine && (
          <span className="text-sm text-ink-muted">
            {tag ? `Chủ đề #${tag}` : `Kết quả cho "${q}"`} ·{" "}
            <Link href="/forum" className="link-brand">
              Xóa bộ lọc
            </Link>
          </span>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!data && !error && <p className="text-ink-muted text-sm">Đang tải...</p>}
      {data && data.content.length === 0 && (
        <p className="text-ink-muted text-sm">
          {mine ? "Bạn chưa có bài viết nào." : filtered ? "Không có bài viết nào phù hợp." : "Chưa có bài viết nào, hãy là người đầu tiên!"}
        </p>
      )}
        {!mine && !filtered && featuredThreads.length > 0 && (
  <section className="space-y-3">
    <div>
      <h2 className="text-lg font-bold text-brand-darker">
        Thảo luận nổi bật
      </h2>
      <p className="text-sm text-ink-muted">
        Những bình luận đang nhận được nhiều lượt thích.
      </p>
    </div>

    {featuredThreads.map(({ root, featuredComment }) => (
      <article
        key={root.id}
        className="overflow-hidden rounded-xl border border-brand-light bg-white"
      >
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-ink-muted">
            <span>Bài viết gốc</span>
            <span>·</span>
            <span>{root.authorName}</span>
          </div>

          <Link
            href={`/forum/thread?id=${root.id}`}
            className="block font-semibold text-brand-darker hover:underline"
          >
            {root.content}
          </Link>

          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink-muted">
                Bình luận nổi bật · {featuredComment.authorName}
              </span>

              <span className="text-xs font-semibold text-red-600">
                ♥ {featuredComment.likeCount}
              </span>
            </div>

            <Link
              href={`/forum/thread?id=${root.id}`}
              className="block whitespace-pre-wrap text-sm leading-6 text-ink hover:text-brand-darker"
            >
              {featuredComment.content}
            </Link>

            <div className="mt-3">
              <Link
                href={`/forum/thread?id=${root.id}`}
                className="text-xs font-medium text-brand-darker hover:underline"
              >
                Xem cuộc thảo luận →
              </Link>
            </div>
          </div>
        </div>
      </article>
    ))}
  </section>
)}
      <div className="space-y-3">
        {data?.content.map((p) => (
          <PostCard key={p.id} post={p} mode="feed" isAdmin={isAdmin} onChanged={() => setReloadKey((k) => k + 1)} />
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex gap-2 pt-2 justify-center">
          <button
            disabled={page === 0}
            onClick={() => setPageState({ key: filterKey, page: page - 1 })}
            className="btn-secondary disabled:opacity-40"
          >
            Trước
          </button>
          <span className="px-3 py-2 text-sm text-ink-muted">
            Trang {page + 1}/{data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages - 1}
            onClick={() => setPageState({ key: filterKey, page: page + 1 })}
            className="btn-secondary disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </main>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-12">Đang tải...</main>}>
      <Feed />
    </Suspense>
  );
}