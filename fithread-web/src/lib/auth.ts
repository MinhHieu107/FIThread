import { apiFetch } from "./api";

export interface CurrentUser {
  email: string;
  fullName: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await apiFetch<CurrentUser>("/auth/me");
  } catch {
    return null;
  }
}