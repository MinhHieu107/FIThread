"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { prepareImage } from "@/lib/imageUtils";

const MAX_IMAGES = 4;

interface Props {
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  tagHint?: boolean;
  allowImages?: boolean;
  onSubmit: (content: string, images: File[]) => Promise<void>;
  onCancel?: () => void;
}

interface Attached {
  file: File;
  preview: string;
}

export default function Composer({
  placeholder,
  submitLabel,
  initialValue = "",
  tagHint = false,
  allowImages = false,
  onSubmit,
  onCancel,
}: Props) {
  const [text, setText] = useState(initialValue);
  const [attached, setAttached] = useState<Attached[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const attachedRef = useRef<Attached[]>([]);

  attachedRef.current = attached;

  useEffect(() => {
    return () => attachedRef.current.forEach((a) => URL.revokeObjectURL(a.preview));
  }, []);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (chosen.length === 0) return;

    const room = MAX_IMAGES - attached.length;
    if (room <= 0) {
      setError(`Tối đa ${MAX_IMAGES} ảnh mỗi bài.`);
      return;
    }

    setError("");
    setPreparing(true);
    try {
      const prepared: Attached[] = [];
      for (const f of chosen.slice(0, room)) {
        if (!f.type.startsWith("image/")) {
          setError("Chỉ chọn được tệp ảnh.");
          continue;
        }
        const file = await prepareImage(f);
        prepared.push({ file, preview: URL.createObjectURL(file) });
      }
      setAttached((prev) => [...prev, ...prepared]);
      if (chosen.length > room) setError(`Tối đa ${MAX_IMAGES} ảnh mỗi bài, đã bỏ bớt ảnh thừa.`);
    } finally {
      setPreparing(false);
    }
  }

  function removeImage(index: number) {
    setAttached((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content && attached.length === 0) return;

    setError("");
    setLoading(true);
    try {
      await onSubmit(content, attached.map((a) => a.file));
      setText("");
      attached.forEach((a) => URL.revokeObjectURL(a.preview));
      setAttached([]);
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

      {attached.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {attached.map((a, i) => (
            <div key={a.preview} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.preview} alt="Ảnh xem trước" className="h-20 w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                aria-label="Bỏ ảnh này"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span>
            {text.trim().length}/500{tagHint ? " · gõ #chude để gắn chủ đề" : ""}
          </span>
          {allowImages && (
            <label className="link-brand cursor-pointer">
              {preparing ? "Đang xử lý ảnh..." : `Thêm ảnh (${attached.length}/${MAX_IMAGES})`}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={preparing || attached.length >= MAX_IMAGES}
                onChange={handleFiles}
              />
            </label>
          )}
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={loading || preparing || (!text.trim() && attached.length === 0)}
            className="btn-primary"
          >
            {loading ? "Đang gửi..." : submitLabel}
          </button>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}