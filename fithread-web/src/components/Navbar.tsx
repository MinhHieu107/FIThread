"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sync = () => {
      const logged = isLoggedIn();
      setLoggedIn(logged);
      if (!logged) {
        setRole(null);
        return;
      }
      getCurrentUser().then((u) => setRole(u?.role ?? null));
    };
    sync();
    window.addEventListener("fithread-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("fithread-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
    setRole(null);
    router.push("/");
  }

  const link = "text-ink hover:text-brand-darker";
  const isManager = role === "ADMIN" || role === "FACULTY";

  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 px-8 py-4 bg-white border-b border-brand-light">
      <Link href="/" className="font-bold text-lg text-brand-darker">FIThread</Link>
      <Link href="/courses" className={link}>Môn học</Link>
      <Link href="/alumni" className={link}>Alumni</Link>
      <Link href="/timeline" className={link}>Dòng thời gian</Link>

      {isManager && <Link href="/dashboard" className={link}>Dashboard</Link>}
      {role === "ADMIN" && (
        <>
          <Link href="/admin/moderation" className={`${link} text-sm`}>Kiểm duyệt</Link>
          <Link href="/admin/offerings" className={`${link} text-sm`}>Lần mở lớp</Link>
          <Link href="/admin/catalog" className={`${link} text-sm`}>Nhập môn học</Link>
          <Link href="/admin/knowledge" className={`${link} text-sm`}>Kho tri thức</Link>
          <Link href="/admin/unanswered" className={`${link} text-sm`}>Câu hỏi chưa trả lời</Link>
        </>
      )}

      <span className="flex-1" />
      {loggedIn ? (
        <button onClick={handleLogout} className={link}>Đăng xuất</button>
      ) : (
        <Link href="/login" className={link}>Đăng nhập</Link>
      )}
    </nav>
  );
}