"use client";

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} sao`}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition-colors ${
            n <= value ? "text-brand-dark" : "text-gray-300 hover:text-brand"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-brand-dark">
        {"★".repeat(filled)}
        <span className="text-gray-300">{"★".repeat(5 - filled)}</span>
      </span>
      <span className="text-sm text-ink-muted">{value.toFixed(1)}</span>
    </span>
  );
}