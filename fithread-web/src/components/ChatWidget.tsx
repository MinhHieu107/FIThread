"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch, ApiError, isLoggedIn } from "@/lib/api";
import { ChatMessageView, ChatReply } from "@/types/chat";

const STORAGE_KEY = "fithread_chat_conversation";

export default function ChatWidget() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn());
    sync();
    window.addEventListener("fithread-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("fithread-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Khôi phục cuộc trò chuyện gần nhất; xóa khi đăng xuất
  useEffect(() => {
    if (!loggedIn) {
      localStorage.removeItem(STORAGE_KEY);
      setConversationId(null);
      setMessages([]);
      setOpen(false);
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const id = Number(saved);
    apiFetch<ChatMessageView[]>(`/chat/conversations/${id}`)
      .then((msgs) => {
        setConversationId(id);
        setMessages(msgs);
      })
      .catch(() => localStorage.removeItem(STORAGE_KEY));
  }, [loggedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setSending(true);
    setInput("");
    const tempId = -Date.now();
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "USER", content: text, status: null, sources: [], helpful: null },
    ]);

    try {
      const reply = await apiFetch<ChatReply>("/chat", {
        method: "POST",
        body: JSON.stringify({ conversationId, message: text }),
      });
      setConversationId(reply.conversationId);
      localStorage.setItem(STORAGE_KEY, String(reply.conversationId));
      setMessages((prev) => [
        ...prev,
        {
          id: reply.messageId,
          role: "BOT",
          content: reply.answer,
          status: reply.status,
          sources: reply.sources,
          helpful: null,
        },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  async function sendFeedback(messageId: number, helpful: boolean) {
    try {
      await apiFetch(`/chat/messages/${messageId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ helpful }),
      });
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, helpful } : m)));
    } catch {
      // bỏ qua lỗi phản hồi, không làm gián đoạn cuộc trò chuyện
    }
  }

  function newConversation() {
    localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setMessages([]);
    setError("");
  }

  if (!loggedIn) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-lg border border-brand-light bg-white shadow-xl">
          <div className="flex items-center justify-between bg-brand-dark px-4 py-3 text-white">
            <div>
              <p className="font-semibold leading-tight">Trợ lý FIThread</p>
              <p className="text-xs opacity-90">Hỏi đáp về khoa và trường</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={newConversation} className="underline" title="Bắt đầu cuộc trò chuyện mới">
                Mới
              </button>
              <button onClick={() => setOpen(false)} aria-label="Đóng">
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-brand-lighter p-3">
            {messages.length === 0 && (
              <p className="text-sm text-ink-muted">
                Xin chào! Bạn có thể hỏi mình về khoa, chương trình đào tạo và các môn học. Ví dụ: “Môn Cấu trúc dữ liệu
                và giải thuật mấy tín chỉ?”
              </p>
            )}

            {messages.map((m) =>
              m.role === "USER" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-brand px-3 py-2 text-sm">{m.content}</p>
                </div>
              ) : (
                <div key={m.id} className="flex flex-col items-start gap-1">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                    {m.content}
                  </p>
                  {m.sources.length > 0 && (
                    <p className="max-w-[85%] text-xs text-ink-muted">Nguồn: {m.sources.join(", ")}</p>
                  )}
                  <div className="flex gap-2 text-xs text-ink-muted">
                    <button
                      onClick={() => sendFeedback(m.id, true)}
                      className={m.helpful === true ? "font-semibold text-brand-darker" : "hover:text-brand-darker"}
                    >
                      Hữu ích
                    </button>
                    <button
                      onClick={() => sendFeedback(m.id, false)}
                      className={m.helpful === false ? "font-semibold text-red-600" : "hover:text-red-600"}
                    >
                      Chưa đúng
                    </button>
                  </div>
                </div>
              )
            )}

            {sending && <p className="text-sm text-ink-muted">Đang trả lời...</p>}
            <div ref={bottomRef} />
          </div>

          {error && <p className="bg-white px-3 pt-2 text-xs text-red-600">{error}</p>}

          <form onSubmit={send} className="flex gap-2 border-t border-brand-light bg-white p-3">
            <input
              className="input-field !mb-0"
              placeholder="Nhập câu hỏi..."
              maxLength={500}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary">
              Gửi
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="btn-primary rounded-full px-5 py-3 shadow-lg"
          aria-label="Mở trợ lý FIThread"
        >
          Hỏi FIThread
        </button>
      )}
    </div>
  );
}