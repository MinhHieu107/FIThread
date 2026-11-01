"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";

interface Props {
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  tagHint?: boolean;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

export default function Composer({
  placeholder,
  submitLabel,
  initialValue = "",
  tagHint = false,
  onSubmit,
  onCancel,
}: Props) {
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;

    setError("");
    setLoading(true);
    try {
      await onSubmit(content);
      setText("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="input-field !mb-0"
        rows={3}
        maxLength={500}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-ink-muted">
          {text.trim().length}/500{tagHint ? " · gõ #chude để gắn chủ đề" : ""}
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Hủy
            </button>
          )}
          <button type="submit" disabled={loading || !text.trim()} className="btn-primary">
            {loading ? "Đang gửi..." : submitLabel}
          </button>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}