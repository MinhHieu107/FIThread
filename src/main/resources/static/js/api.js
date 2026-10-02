const API_BASE = "/api";

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("fithread_token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(API_BASE + path, { ...options, headers });

    if (res.status === 401) {
        localStorage.removeItem("fithread_token");
        if (!location.pathname.endsWith("/login.html")) {
            location.href = "/login.html";
        }
        return null;
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Có lỗi xảy ra" }));
        throw new Error(err.message || "Có lỗi xảy ra");
    }

    if (res.status === 204) return null;
    return res.json();
}