const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem("fithread_access_token") : null;
}

function getRefreshToken() {
  return typeof window !== "undefined" ? localStorage.getItem("fithread_refresh_token") : null;
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fithread-auth-changed"));
  }
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("fithread_access_token", accessToken);
  localStorage.setItem("fithread_refresh_token", refreshToken);
  notifyAuthChanged();
}

export function clearTokens() {
  localStorage.removeItem("fithread_access_token");
  localStorage.removeItem("fithread_refresh_token");
  notifyAuthChanged();
}

let refreshPromise: Promise<string | null> | null = null;

/** Goi /auth/refresh de lay access token moi. Dung chung 1 promise neu nhieu request cung 401 mot luc. */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = await res.json();
      saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    })
    .catch(() => {
      clearTokens();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _isRetry = false
): Promise<T> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !_isRetry && path !== "/auth/refresh" && path !== "/auth/login") {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      return apiFetch<T>(path, options, true); // thu lai dung 1 lan, voi token moi
    }

    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError("Phien dang nhap da het han", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Co loi xay ra" }));
    throw new ApiError(body.message || "Co loi xay ra", res.status);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Khong chan dang xuat neu goi API loi - van xoa token local
    }
  }
  clearTokens();
}

export function isLoggedIn() {
  return !!getAccessToken();
}
export function getAccessTokenForUpload() {
  return getAccessToken();
}
/** Gui form co tep (multipart). Khong dat Content-Type de trinh duyet tu them ranh gioi. */
export async function apiUpload<T>(path: string, formData: FormData, _isRetry = false): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (res.status === 401 && !_isRetry) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) return apiUpload<T>(path, formData, true);

    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError("Phien dang nhap da het han", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Co loi xay ra" }));
    throw new ApiError(body.message || "Co loi xay ra", res.status);
  }
  return res.json();
}

/** Tai tep (anh) can xac thuc ve dang Blob. */
export async function apiFetchBlob(path: string, _isRetry = false): Promise<Blob> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 401 && !_isRetry) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) return apiFetchBlob(path, true);

    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError("Phien dang nhap da het han", 401);
  }

  if (!res.ok) throw new ApiError("Khong tai duoc anh", res.status);
  return res.blob();
}