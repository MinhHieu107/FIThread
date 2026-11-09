(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ChatWidget.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const STORAGE_KEY = "fithread_chat_conversation";
function ChatWidget() {
    _s();
    const [loggedIn, setLoggedIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [conversationId, setConversationId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [sending, setSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const bottomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWidget.useEffect": ()=>{
            const sync = {
                "ChatWidget.useEffect.sync": ()=>setLoggedIn((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLoggedIn"])())
            }["ChatWidget.useEffect.sync"];
            sync();
            window.addEventListener("fithread-auth-changed", sync);
            window.addEventListener("storage", sync);
            return ({
                "ChatWidget.useEffect": ()=>{
                    window.removeEventListener("fithread-auth-changed", sync);
                    window.removeEventListener("storage", sync);
                }
            })["ChatWidget.useEffect"];
        }
    }["ChatWidget.useEffect"], []);
    // Khôi phục cuộc trò chuyện gần nhất; xóa khi đăng xuất
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWidget.useEffect": ()=>{
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/chat/conversations/${id}`).then({
                "ChatWidget.useEffect": (msgs)=>{
                    setConversationId(id);
                    setMessages(msgs);
                }
            }["ChatWidget.useEffect"]).catch({
                "ChatWidget.useEffect": ()=>localStorage.removeItem(STORAGE_KEY)
            }["ChatWidget.useEffect"]);
        }
    }["ChatWidget.useEffect"], [
        loggedIn
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWidget.useEffect": ()=>{
            bottomRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }["ChatWidget.useEffect"], [
        messages,
        open,
        sending
    ]);
    async function send(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;
        setError("");
        setSending(true);
        setInput("");
        const tempId = -Date.now();
        setMessages((prev)=>[
                ...prev,
                {
                    id: tempId,
                    role: "USER",
                    content: text,
                    status: null,
                    sources: [],
                    helpful: null
                }
            ]);
        try {
            const reply = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/chat", {
                method: "POST",
                body: JSON.stringify({
                    conversationId,
                    message: text
                })
            });
            setConversationId(reply.conversationId);
            localStorage.setItem(STORAGE_KEY, String(reply.conversationId));
            setMessages((prev_1)=>[
                    ...prev_1,
                    {
                        id: reply.messageId,
                        role: "BOT",
                        content: reply.answer,
                        status: reply.status,
                        sources: reply.sources,
                        helpful: null
                    }
                ]);
        } catch (err) {
            setError(err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? err.message : "Có lỗi xảy ra");
            setMessages((prev_0)=>prev_0.filter((m)=>m.id !== tempId));
            setInput(text);
        } finally{
            setSending(false);
        }
    }
    async function sendFeedback(messageId, helpful) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])(`/chat/messages/${messageId}/feedback`, {
                method: "POST",
                body: JSON.stringify({
                    helpful
                })
            });
            setMessages((prev_2)=>prev_2.map((m_0)=>m_0.id === messageId ? {
                        ...m_0,
                        helpful
                    } : m_0));
        } catch  {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-5 right-5 z-50",
        children: open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-lg border border-brand-light bg-white shadow-xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between bg-brand-dark px-4 py-3 text-white",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold leading-tight",
                                    children: "Trợ lý FIThread"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWidget.tsx",
                                    lineNumber: 118,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs opacity-90",
                                    children: "Hỏi đáp về khoa và trường"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWidget.tsx",
                                    lineNumber: 119,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ChatWidget.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: newConversation,
                                    className: "underline",
                                    title: "Bắt đầu cuộc trò chuyện mới",
                                    children: "Mới"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWidget.tsx",
                                    lineNumber: 122,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setOpen(false),
                                    "aria-label": "Đóng",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWidget.tsx",
                                    lineNumber: 125,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ChatWidget.tsx",
                            lineNumber: 121,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ChatWidget.tsx",
                    lineNumber: 116,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 space-y-3 overflow-y-auto bg-brand-lighter p-3",
                    children: [
                        messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-ink-muted",
                            children: "Xin chào! Bạn có thể hỏi mình về khoa, chương trình đào tạo và các môn học. Ví dụ: “Môn Cấu trúc dữ liệu và giải thuật mấy tín chỉ?”"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ChatWidget.tsx",
                            lineNumber: 132,
                            columnNumber: 39
                        }, this),
                        messages.map((m_1)=>m_1.role === "USER" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "max-w-[85%] whitespace-pre-wrap rounded-lg bg-brand px-3 py-2 text-sm",
                                    children: m_1.content
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChatWidget.tsx",
                                    lineNumber: 138,
                                    columnNumber: 19
                                }, this)
                            }, m_1.id, false, {
                                fileName: "[project]/src/components/ChatWidget.tsx",
                                lineNumber: 137,
                                columnNumber: 56
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-start gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "max-w-[85%] whitespace-pre-wrap rounded-lg bg-white px-3 py-2 text-sm shadow-sm",
                                        children: m_1.content
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChatWidget.tsx",
                                        lineNumber: 140,
                                        columnNumber: 19
                                    }, this),
                                    m_1.sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "max-w-[85%] text-xs text-ink-muted",
                                        children: [
                                            "Nguồn: ",
                                            m_1.sources.join(", ")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ChatWidget.tsx",
                                        lineNumber: 143,
                                        columnNumber: 46
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2 text-xs text-ink-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>sendFeedback(m_1.id, true),
                                                className: m_1.helpful === true ? "font-semibold text-brand-darker" : "hover:text-brand-darker",
                                                children: "Hữu ích"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChatWidget.tsx",
                                                lineNumber: 145,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>sendFeedback(m_1.id, false),
                                                className: m_1.helpful === false ? "font-semibold text-red-600" : "hover:text-red-600",
                                                children: "Chưa đúng"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChatWidget.tsx",
                                                lineNumber: 148,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ChatWidget.tsx",
                                        lineNumber: 144,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, m_1.id, true, {
                                fileName: "[project]/src/components/ChatWidget.tsx",
                                lineNumber: 139,
                                columnNumber: 26
                            }, this)),
                        sending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-ink-muted",
                            children: "Đang trả lời..."
                        }, void 0, false, {
                            fileName: "[project]/src/components/ChatWidget.tsx",
                            lineNumber: 154,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: bottomRef
                        }, void 0, false, {
                            fileName: "[project]/src/components/ChatWidget.tsx",
                            lineNumber: 155,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ChatWidget.tsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "bg-white px-3 pt-2 text-xs text-red-600",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/components/ChatWidget.tsx",
                    lineNumber: 158,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: send,
                    className: "flex gap-2 border-t border-brand-light bg-white p-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            className: "input-field !mb-0",
                            placeholder: "Nhập câu hỏi...",
                            maxLength: 500,
                            value: input,
                            onChange: (e_0)=>setInput(e_0.target.value)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ChatWidget.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: sending || !input.trim(),
                            className: "btn-primary",
                            children: "Gửi"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ChatWidget.tsx",
                            lineNumber: 162,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ChatWidget.tsx",
                    lineNumber: 160,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ChatWidget.tsx",
            lineNumber: 115,
            columnNumber: 15
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: ()=>setOpen(true),
            className: "btn-primary rounded-full px-5 py-3 shadow-lg",
            "aria-label": "Mở trợ lý FIThread",
            children: "Hỏi FIThread"
        }, void 0, false, {
            fileName: "[project]/src/components/ChatWidget.tsx",
            lineNumber: 166,
            columnNumber: 18
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ChatWidget.tsx",
        lineNumber: 114,
        columnNumber: 10
    }, this);
}
_s(ChatWidget, "EpUV1TktL+1PDYS0aGj3GEukBtM=");
_c = ChatWidget;
var _c;
__turbopack_context__.k.register(_c, "ChatWidget");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function Navbar() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(39);
    if ($[0] !== "c723b73db9d54848a1c337ddd149b749a0abc614694090cf5423ec9991aa8066") {
        for(let $i = 0; $i < 39; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "c723b73db9d54848a1c337ddd149b749a0abc614694090cf5423ec9991aa8066";
    }
    const [loggedIn, setLoggedIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [needsBackupEmail, setNeedsBackupEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [adminMenuOpen, setAdminMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const adminMenuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "Navbar[useEffect()]": ()=>{
                const sync = {
                    "Navbar[useEffect() > sync]": ()=>{
                        const logged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLoggedIn"])();
                        setLoggedIn(logged);
                        if (!logged) {
                            setRole(null);
                            setNeedsBackupEmail(false);
                            setAdminMenuOpen(false);
                            return;
                        }
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentUser"])().then({
                            "Navbar[useEffect() > sync > (anonymous)()]": (u)=>{
                                setRole(u?.role ?? null);
                                setNeedsBackupEmail(!!u?.needsBackupEmail);
                            }
                        }["Navbar[useEffect() > sync > (anonymous)()]"]);
                    }
                }["Navbar[useEffect() > sync]"];
                sync();
                window.addEventListener("fithread-auth-changed", sync);
                window.addEventListener("storage", sync);
                return ()=>{
                    window.removeEventListener("fithread-auth-changed", sync);
                    window.removeEventListener("storage", sync);
                };
            }
        })["Navbar[useEffect()]"];
        t1 = [];
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    let t2;
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "Navbar[useEffect()]": ()=>{
                const handleClickOutside = {
                    "Navbar[useEffect() > handleClickOutside]": (event)=>{
                        if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
                            setAdminMenuOpen(false);
                        }
                    }
                }["Navbar[useEffect() > handleClickOutside]"];
                document.addEventListener("mousedown", handleClickOutside);
                return ()=>{
                    document.removeEventListener("mousedown", handleClickOutside);
                };
            }
        })["Navbar[useEffect()]"];
        t3 = [];
        $[3] = t2;
        $[4] = t3;
    } else {
        t2 = $[3];
        t3 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    let t4;
    if ($[5] !== router) {
        t4 = async function handleLogout() {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])();
            setLoggedIn(false);
            setRole(null);
            setNeedsBackupEmail(false);
            setAdminMenuOpen(false);
            router.push("/");
        };
        $[5] = router;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    const handleLogout = t4;
    const isManager = role === "ADMIN" || role === "FACULTY";
    let t5;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = [
            {
                href: "/admin/moderation",
                label: "Ki\u1EC3m duy\u1EC7t"
            },
            {
                href: "/admin/offerings",
                label: "L\u1EA7n m\u1EDF l\u1EDBp"
            },
            {
                href: "/admin/catalog",
                label: "Nh\u1EADp m\xF4n h\u1ECDc"
            },
            {
                href: "/admin/knowledge",
                label: "Kho tri th\u1EE9c"
            },
            {
                href: "/admin/unanswered",
                label: "C\xE2u h\u1ECFi ch\u01B0a tr\u1EA3 l\u1EDDi"
            },
            {
                href: "/admin/alumni",
                label: "Duy\u1EC7t alumni"
            },
            {
                href: "/admin/users",
                label: "Ng\u01B0\u1EDDi d\xF9ng"
            },
            {
                href: "/admin/graduation",
                label: "T\u1ED1t nghi\u1EC7p"
            },
            {
                href: "/admin/timeline",
                label: "S\u1EEDa d\xF2ng th\u1EDDi gian"
            },
            {
                href: "/admin/forum",
                label: "Ki\u1EC3m duy\u1EC7t di\u1EC5n \u0111\xE0n"
            }
        ];
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    const adminLinks = t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/",
            className: "font-bold text-lg text-brand-darker",
            children: "FIThread"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 149,
            columnNumber: 10
        }, this);
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/courses",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Môn học"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 150,
            columnNumber: 10
        }, this);
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/alumni",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Alumni"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 151,
            columnNumber: 10
        }, this);
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/timeline",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Dòng thời gian"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 152,
            columnNumber: 10
        }, this);
        $[8] = t6;
        $[9] = t7;
        $[10] = t8;
        $[11] = t9;
    } else {
        t6 = $[8];
        t7 = $[9];
        t8 = $[10];
        t9 = $[11];
    }
    let t10;
    if ($[12] !== loggedIn) {
        t10 = loggedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/forum",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Diễn đàn"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 165,
            columnNumber: 23
        }, this);
        $[12] = loggedIn;
        $[13] = t10;
    } else {
        t10 = $[13];
    }
    let t11;
    if ($[14] !== isManager) {
        t11 = isManager && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/dashboard",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Dashboard"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 173,
            columnNumber: 24
        }, this);
        $[14] = isManager;
        $[15] = t11;
    } else {
        t11 = $[15];
    }
    let t12;
    if ($[16] !== role) {
        t12 = role === "ALUMNI" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/alumni/me",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Hồ sơ của tôi"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 181,
            columnNumber: 32
        }, this);
        $[16] = role;
        $[17] = t12;
    } else {
        t12 = $[17];
    }
    let t13;
    if ($[18] !== adminMenuOpen || $[19] !== role) {
        t13 = role === "ADMIN" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative",
            ref: adminMenuRef,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: {
                        "Navbar[<button>.onClick]": ()=>setAdminMenuOpen(_NavbarButtonOnClickSetAdminMenuOpen)
                    }["Navbar[<button>.onClick]"],
                    "aria-expanded": adminMenuOpen,
                    "aria-haspopup": "true",
                    className: "flex items-center gap-2 text-ink hover:text-brand-darker transition-colors font-medium",
                    children: [
                        "Quản trị",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: `h-4 w-4 transition-transform ${adminMenuOpen ? "rotate-180" : ""}`,
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            "aria-hidden": "true",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                fillRule: "evenodd",
                                d: "M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z",
                                clipRule: "evenodd"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 191,
                                columnNumber: 340
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/Navbar.tsx",
                            lineNumber: 191,
                            columnNumber: 196
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Navbar.tsx",
                    lineNumber: 189,
                    columnNumber: 76
                }, this),
                adminMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-brand-light bg-white py-2 shadow-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500",
                            children: "Quản lý hệ thống"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Navbar.tsx",
                            lineNumber: 191,
                            columnNumber: 687
                        }, this),
                        adminLinks.map({
                            "Navbar[adminLinks.map()]": (item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: item.href,
                                    onClick: {
                                        "Navbar[adminLinks.map() > <Link>.onClick]": ()=>setAdminMenuOpen(false)
                                    }["Navbar[adminLinks.map() > <Link>.onClick]"],
                                    className: "block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-brand-light hover:text-brand-darker",
                                    children: item.label
                                }, item.href, false, {
                                    fileName: "[project]/src/components/Navbar.tsx",
                                    lineNumber: 192,
                                    columnNumber: 47
                                }, this)
                        }["Navbar[adminLinks.map()]"])
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Navbar.tsx",
                    lineNumber: 191,
                    columnNumber: 558
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 189,
            columnNumber: 31
        }, this);
        $[18] = adminMenuOpen;
        $[19] = role;
        $[20] = t13;
    } else {
        t13 = $[20];
    }
    let t14;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex-1"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 204,
            columnNumber: 11
        }, this);
        $[21] = t14;
    } else {
        t14 = $[21];
    }
    let t15;
    if ($[22] !== loggedIn) {
        t15 = loggedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/account",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Tài khoản"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 211,
            columnNumber: 23
        }, this);
        $[22] = loggedIn;
        $[23] = t15;
    } else {
        t15 = $[23];
    }
    let t16;
    if ($[24] !== handleLogout || $[25] !== loggedIn) {
        t16 = loggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: handleLogout,
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Đăng xuất"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 219,
            columnNumber: 22
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/login",
            className: "text-ink hover:text-brand-darker transition-colors",
            children: "Đăng nhập"
        }, void 0, false, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 219,
            columnNumber: 137
        }, this);
        $[24] = handleLogout;
        $[25] = loggedIn;
        $[26] = t16;
    } else {
        t16 = $[26];
    }
    let t17;
    if ($[27] !== t10 || $[28] !== t11 || $[29] !== t12 || $[30] !== t13 || $[31] !== t15 || $[32] !== t16) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "flex flex-wrap items-center gap-x-6 gap-y-2 px-8 py-4 bg-white border-b border-brand-light",
            children: [
                t6,
                t7,
                t8,
                t9,
                t10,
                t11,
                t12,
                t13,
                t14,
                t15,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 228,
            columnNumber: 11
        }, this);
        $[27] = t10;
        $[28] = t11;
        $[29] = t12;
        $[30] = t13;
        $[31] = t15;
        $[32] = t16;
        $[33] = t17;
    } else {
        t17 = $[33];
    }
    let t18;
    if ($[34] !== needsBackupEmail) {
        t18 = needsBackupEmail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-brand-light px-8 py-2 text-sm",
            children: [
                "Bạn cần bổ sung email dự phòng cá nhân (xác thực bằng mã OTP) để hoàn tất hồ sơ cựu sinh viên và xuất hiện trong danh bạ.",
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/account",
                    className: "link-brand font-medium",
                    children: "Bổ sung ngay"
                }, void 0, false, {
                    fileName: "[project]/src/components/Navbar.tsx",
                    lineNumber: 241,
                    columnNumber: 207
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 241,
            columnNumber: 31
        }, this);
        $[34] = needsBackupEmail;
        $[35] = t18;
    } else {
        t18 = $[35];
    }
    let t19;
    if ($[36] !== t17 || $[37] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "relative z-50",
            children: [
                t17,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 249,
            columnNumber: 11
        }, this);
        $[36] = t17;
        $[37] = t18;
        $[38] = t19;
    } else {
        t19 = $[38];
    }
    return t19;
}
_s(Navbar, "2uJO1UxhxRqlT2oSIrEIY07CsfU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Navbar;
function _NavbarButtonOnClickSetAdminMenuOpen(prev) {
    return !prev;
}
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "apiFetch",
    ()=>apiFetch,
    "apiFetchBlob",
    ()=>apiFetchBlob,
    "apiUpload",
    ()=>apiUpload,
    "clearTokens",
    ()=>clearTokens,
    "getAccessTokenForUpload",
    ()=>getAccessTokenForUpload,
    "isLoggedIn",
    ()=>isLoggedIn,
    "logout",
    ()=>logout,
    "saveTokens",
    ()=>saveTokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";
class ApiError extends Error {
    status;
    constructor(message, status){
        super(message);
        this.status = status;
    }
}
function getAccessToken() {
    return ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("fithread_access_token") : "TURBOPACK unreachable";
}
function getRefreshToken() {
    return ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("fithread_refresh_token") : "TURBOPACK unreachable";
}
function notifyAuthChanged() {
    if ("TURBOPACK compile-time truthy", 1) {
        window.dispatchEvent(new Event("fithread-auth-changed"));
    }
}
function saveTokens(accessToken, refreshToken) {
    localStorage.setItem("fithread_access_token", accessToken);
    localStorage.setItem("fithread_refresh_token", refreshToken);
    notifyAuthChanged();
}
function clearTokens() {
    localStorage.removeItem("fithread_access_token");
    localStorage.removeItem("fithread_refresh_token");
    notifyAuthChanged();
}
let refreshPromise = null;
/** Goi /auth/refresh de lay access token moi. Dung chung 1 promise neu nhieu request cung 401 mot luc. */ async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            refreshToken
        })
    }).then(async (res)=>{
        if (!res.ok) {
            clearTokens();
            return null;
        }
        const data = await res.json();
        saveTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    }).catch(()=>{
        clearTokens();
        return null;
    }).finally(()=>{
        refreshPromise = null;
    });
    return refreshPromise;
}
async function apiFetch(path, options = {}, _isRetry = false) {
    const token = getAccessToken();
    const headers = {
        "Content-Type": "application/json",
        ...token ? {
            Authorization: `Bearer ${token}`
        } : {},
        ...options.headers || {}
    };
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });
    if (res.status === 401 && !_isRetry && path !== "/auth/refresh" && path !== "/auth/login") {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
            return apiFetch(path, options, true); // thu lai dung 1 lan, voi token moi
        }
        if (("TURBOPACK compile-time value", "object") !== "undefined" && !window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
        }
        throw new ApiError("Phien dang nhap da het han", 401);
    }
    if (!res.ok) {
        const body = await res.json().catch(()=>({
                message: "Co loi xay ra"
            }));
        throw new ApiError(body.message || "Co loi xay ra", res.status);
    }
    if (res.status === 204) return null;
    return res.json();
}
async function logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    refreshToken
                })
            });
        } catch  {
        // Khong chan dang xuat neu goi API loi - van xoa token local
        }
    }
    clearTokens();
}
function isLoggedIn() {
    return !!getAccessToken();
}
function getAccessTokenForUpload() {
    return getAccessToken();
}
async function apiUpload(path, formData, _isRetry = false) {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: token ? {
            Authorization: `Bearer ${token}`
        } : {},
        body: formData
    });
    if (res.status === 401 && !_isRetry) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) return apiUpload(path, formData, true);
        if (("TURBOPACK compile-time value", "object") !== "undefined" && !window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
        }
        throw new ApiError("Phien dang nhap da het han", 401);
    }
    if (!res.ok) {
        const body = await res.json().catch(()=>({
                message: "Co loi xay ra"
            }));
        throw new ApiError(body.message || "Co loi xay ra", res.status);
    }
    return res.json();
}
async function apiFetchBlob(path, _isRetry = false) {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE}${path}`, {
        headers: token ? {
            Authorization: `Bearer ${token}`
        } : {}
    });
    if (res.status === 401 && !_isRetry) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) return apiFetchBlob(path, true);
        if (("TURBOPACK compile-time value", "object") !== "undefined" && !window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
        }
        throw new ApiError("Phien dang nhap da het han", 401);
    }
    if (!res.ok) throw new ApiError("Khong tai duoc anh", res.status);
    return res.blob();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentUser",
    ()=>getCurrentUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
async function getCurrentUser() {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/auth/me");
    } catch  {
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1nv7azk._.js.map