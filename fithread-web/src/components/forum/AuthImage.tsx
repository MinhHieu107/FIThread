"use client";

import { useEffect, useState } from "react";
import { apiFetchBlob } from "@/lib/api";

const cache = new Map<number, string>();

export default function AuthImage({ id, className }: { id: number; className?: string }) {
  const [url, setUrl] = useState<string | null>(cache.get(id) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const cached = cache.get(id);
    if (cached) {
      setUrl(cached);
      return;
    }

    let cancelled = false;
    apiFetchBlob(`/forum/images/${id}`)
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        cache.set(id, objectUrl);
        if (!cancelled) setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (failed) {
    return <div className="flex h-24 items-center justify-center bg-brand-light text-xs text-ink-muted">Không tải được ảnh</div>;
  }
  if (!url) {
    return <div className="h-24 animate-pulse bg-brand-light" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Ảnh đính kèm bài viết" className={className} />;
}