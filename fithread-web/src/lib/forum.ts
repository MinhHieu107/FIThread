import { apiFetch, apiUpload } from "./api";

/** Dang bai hoac tra loi: co anh thi gui dang multipart, khong co thi gui JSON. */
export async function submitForumPost(path: string, content: string, images: File[]) {
  if (images.length === 0) {
    return apiFetch(path, { method: "POST", body: JSON.stringify({ content }) });
  }

  const form = new FormData();
  form.append("content", content);
  images.forEach((file) => form.append("images", file));
  return apiUpload(path, form);
}