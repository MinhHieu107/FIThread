import { SentimentCounts } from "@/types/dashboard";

export default function SentimentBar({ positive, neutral, negative }: SentimentCounts) {
  const total = positive + neutral + negative;
  if (total === 0) {
    return <div className="h-2 w-full rounded bg-brand-light" title="Chưa có dữ liệu" />;
  }
  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded bg-brand-light"
      title={`Tích cực ${positive} · Trung lập ${neutral} · Tiêu cực ${negative}`}
    >
      <div className="bg-emerald-600" style={{ width: pct(positive) }} />
      <div className="bg-gray-300" style={{ width: pct(neutral) }} />
      <div className="bg-red-500" style={{ width: pct(negative) }} />
    </div>
  );
}

export function SentimentLegend({ positive, neutral, negative }: SentimentCounts) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
      <span>
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 mr-1" />
        Tích cực {positive}
      </span>
      <span>
        <span className="inline-block h-2 w-2 rounded-full bg-gray-300 mr-1" />
        Trung lập {neutral}
      </span>
      <span>
        <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1" />
        Tiêu cực {negative}
      </span>
    </div>
  );
}