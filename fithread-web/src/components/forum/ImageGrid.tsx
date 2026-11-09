
"use client";

import { useState } from "react";
import AuthImage from "./AuthImage";

export default function ImageGrid({ ids }: { ids: number[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (!ids || ids.length === 0) return null;

  const isSingleImage = ids.length === 1;

  return (
    <>
      <div
        className={`grid w-full gap-2 ${
          isSingleImage ? "grid-cols-1" : "grid-cols-2"
        }`}
      >
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setOpenId(id)}
            className={`flex w-full items-center justify-center overflow-hidden rounded-md bg-brand-light ${
              isSingleImage ? "max-h-80" : "h-40"
            }`}
            aria-label="Xem ảnh lớn"
          >
            <AuthImage
              id={id}
              className={
                isSingleImage
                  ? "block max-h-80 w-full object-contain"
                  : "block h-40 w-full object-cover"
              }
            />
          </button>
        ))}
      </div>

      {openId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
              <AuthImage
                id={openId}
                className="block max-h-[80vh] max-w-full rounded object-contain"
              />
            </div>

            <button
              onClick={() => setOpenId(null)}
              className="btn-secondary mt-3 shrink-0"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
