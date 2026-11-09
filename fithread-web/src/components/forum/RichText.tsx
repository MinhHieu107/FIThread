import Link from "next/link";

const TAG = /(?<![\p{L}\p{N}_])#([\p{L}\p{N}_]{1,50})/gu;

export default function RichText({ text, linkTags }: { text: string; linkTags: boolean }) {
    if (!text) return null;
  if (!linkTags) return <p className="whitespace-pre-wrap text-sm">{text}</p>;
  const parts: React.ReactNode[] = [];
  const re = new RegExp(TAG.source, "gu");
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={m.index} href={`/forum?tag=${encodeURIComponent(m[1].toLowerCase())}`} className="link-brand">
        #{m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <p className="whitespace-pre-wrap text-sm">{parts}</p>;
}