"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [needsBackupEmail, setNeedsBackupEmail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sync = () => {
      const logged = isLoggedIn();
      setLoggedIn(logged);
      if (!logged) {
        setRole(null);
        setNeedsBackupEmail(false);
        return;
      }
      getCurrentUser().then((u) => {
        setRole(u?.role ?? null);
        setNeedsBackupEmail(!!u?.needsBackupEmail);
      });
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
    setNeedsBackupEmail(false);
    router.push("/");
  }

  const link = "text-ink hover:text-brand-darker";
  const small = `${link} text-sm`;
  const isManager = role === "ADMIN" || role === "FACULTY";

  return (
    <header>
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 px-8 py-4 bg-white border-b border-brand-light">
        <Link href="/" className="font-bold text-lg text-brand-darker">FIThread</Link>
        <Link href="/courses" className={link}>Môn học</Link>
        <Link href="/alumni" className={link}>Alumni</Link>
        <Link href="/timeline" className={link}>Dòng thời gian</Link>

        {isManager && <Link href="/dashboard" className={link}>Dashboard</Link>}
        {role === "ALUMNI" && <Link href="/alumni/me" className={link}>Hồ sơ của tôi</Link>}
        {role === "ADMIN" && (
          <>
            <Link href="/admin/moderation" className={small}>Kiểm duyệt</Link>
            <Link href="/admin/offerings" className={small}>Lần mở lớp</Link>
            <Link href="/admin/catalog" className={small}>Nhập môn học</Link>
            <Link href="/admin/knowledge" className={small}>Kho tri thức</Link>
            <Link href="/admin/unanswered" className={small}>Câu hỏi chưa trả lời</Link>
            <Link href="/admin/alumni" className={small}>Duyệt alumni</Link>
            <Link href="/admin/users" className={small}>Người dùng</Link>
            <Link href="/admin/graduation" className={small}>Tốt nghiệp</Link>
          </>
        )}

        <span className="flex-1" />
        {loggedIn && <Link href="/account" className={link}>Tài khoản</Link>}
        {loggedIn ? (
          <button onClick={handleLogout} className={link}>Đăng xuất</button>
        ) : (
          <Link href="/login" className={link}>Đăng nhập</Link>
        )}
      </nav>

      {needsBackupEmail && (
        <div className="bg-brand-light px-8 py-2 text-sm">
          Bạn cần bổ sung email dự phòng cá nhân (xác thực bằng mã OTP) để hoàn tất hồ sơ cựu sinh viên và xuất hiện trong
          danh bạ.{" "}
          <Link href="/account" className="link-brand font-medium">
            Bổ sung ngay
          </Link>
        </div>
      )}
    </header>
  );
}