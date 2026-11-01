"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { LikeResult, PostView } from "@/types/forum";
import Composer from "./Composer";
import RichText from "./RichText";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Sinh viên",
  ALUMNI: "Cựu sinh viên",
  FACULTY: "Giảng viên",
  ADMIN: "Admin",
};

interface Props {
  post: PostView;
  mode: "feed" | "thread";
  isAdmin: boolean;
  onChanged: () => void;
}

export default function PostCard({ post, mode, isAdmin, onChanged }: Props) {
  const [likeState, setLikeState] = useState<{ liked: boolean; count: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [hideReason, setHideReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  if (post.status === "DELETED") {
    return <div className="card text-sm italic text-ink-muted">Bài viết đã bị xóa.</div>;
  }

  const isRoot = post.parentId === null;
  const published = post.status === "PUBLISHED";
  const liked = likeState?.liked ?? post.likedByMe;
  const likeCount = likeState?.count ?? post.likeCount;

  function fail(err: unknown) {
    setNotice({ type: "error", text: err instanceof ApiError ? err.message : "Có lỗi xảy ra" });
  }

  async function toggleLike() {
    setNotice(null);
    try {
      const res = await apiFetch<LikeResult>(`/forum/posts/${post.id}/like`, { method: "POST" });
      setLikeState({ liked: res.liked, count: res.likeCount });
    } catch (err) {
      fail(err);
    }
  }

  async function submitReply(content: string) {
    await apiFetch(`/forum/posts/${post.id}/replies`, { method: "POST", body: JSON.stringify({ content }) });
    setReplying(false);
    onChanged();
  }

  async function submitEdit(content: string) {
    await apiFetch(`/forum/posts/${post.id}`, { method: "PUT", body: JSON.stringify({ content }) });
    setEditing(false);
    onChanged();
  }

  async function remove() {
    if (!confirm("Xóa bài viết này?")) return;
    setNotice(null);
    try {
      await apiFetch(`/forum/posts/${post.id}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      fail(err);
    }
  }

  async function report() {
    const reason = window.prompt("Lý do báo cáo (không bắt buộc):");
    if (reason === null) return;
    setNotice(null);
    try {
      await apiFetch(`/forum/posts/${post.id}/report`, { method: "POST", body: JSON.stringify({ reason }) });
      setNotice({ type: "ok", text: "Đã gửi báo cáo. Cảm ơn bạn!" });
      onChanged();
    } catch (err) {
      fail(err);
    }
  }

  async function confirmHide() {
    if (hideReason.trim().length < 5) {
      setNotice({ type: "error", text: "Vui lòng nhập lý do ẩn (ít nhất 5 ký tự)." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await apiFetch(`/admin/forum/posts/${post.id}/hide`, {
        method: "POST",
        body: JSON.stringify({ reason: hideReason.trim() }),
      });
      setHiding(false);
      setHideReason("");
      onChanged();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">{post.authorName}</span>
        {post.authorRole && <span className="badge">{ROLE_LABELS[post.authorRole] ?? post.authorRole}</span>}
        {post.authorCohort && <span className="text-xs text-ink-muted">{post.authorCohort}</span>}
        <span className="text-xs text-ink-muted">
          · {new Date(post.createdAt).toLocaleString("vi-VN")}
          {post.edited ? " · đã chỉnh sửa" : ""}
        </span>
      </div>

      {post.status === "PENDING_MODERATION" && (
        <p className="rounded-md bg-brand-light px-3 py-2 text-xs">
          {post.mine ? "Bài của bạn đang chờ admin xem xét, người khác chưa nhìn thấy." : "Bài đang chờ kiểm duyệt."}
        </p>
      )}
      {post.status === "HIDDEN" && (
        <p className="rounded-md bg-brand-light px-3 py-2 text-xs">
          {post.mine ? "Bài của bạn đã bị admin ẩn." : "Bài đã bị ẩn."}
        </p>
      )}

      {editing ? (
        <Composer
          placeholder="Nội dung bài viết"
          submitLabel="Lưu"
          initialValue={post.content}
          tagHint={isRoot}
          onSubmit={submitEdit}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <RichText text={post.content} linkTags={isRoot} />
      )}

      {!editing && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
          {published && (
            <button
              onClick={toggleLike}
              className={liked ? "font-semibold text-red-600" : "hover:text-red-600"}
              aria-pressed={liked}
            >
              {liked ? "♥" : "♡"} {likeCount}
            </button>
          )}

          {published &&
            (mode === "thread" ? (
              <button onClick={() => setReplying((v) => !v)} className="hover:text-brand-darker">
                Trả lời
              </button>
            ) : (
              <Link href={`/forum/thread?id=${post.id}`} className="hover:text-brand-darker">
                {post.replyCount > 0 ? `${post.replyCount} trả lời` : "Trả lời"}
              </Link>
            ))}

          {post.mine && (
            <>
              <button onClick={() => setEditing(true)} className="link-brand">
                Sửa
              </button>
              <button onClick={remove} className="text-red-600 hover:underline">
                Xóa
              </button>
            </>
          )}

          {!post.mine && isAdmin && post.status !== "HIDDEN" && (
            <button onClick={() => setHiding((v) => !v)} className="text-red-600 hover:underline">
              Ẩn
            </button>
          )}
          {!post.mine && !isAdmin && published && (
            <button onClick={report} className="hover:text-red-600 hover:underline">
              Báo cáo
            </button>
          )}
        </div>
      )}

      {notice && (
        <p className={`text-xs ${notice.type === "ok" ? "text-green-700" : "text-red-600"}`}>{notice.text}</p>
      )}

      {hiding && (
        <div className="space-y-2 rounded-md bg-brand-lighter p-3">
          <p className="text-sm font-medium">Lý do ẩn bài (bắt buộc, được lưu lại để đối chiếu)</p>
          <textarea
            className="input-field !mb-0"
            rows={2}
            maxLength={500}
            value={hideReason}
            onChange={(e) => setHideReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={confirmHide} disabled={busy} className="btn-primary">
              {busy ? "Đang ẩn..." : "Xác nhận ẩn"}
            </button>
            <button onClick={() => setHiding(false)} disabled={busy} className="btn-secondary">
              Hủy
            </button>
          </div>
        </div>
      )}

      {replying && (
        <div className="pt-1">
          <Composer
            placeholder={`Trả lời ${post.authorName}...`}
            submitLabel="Gửi trả lời"
            onSubmit={submitReply}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}
    </article>
  );
}