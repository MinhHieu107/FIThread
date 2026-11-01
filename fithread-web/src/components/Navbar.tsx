
"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [needsBackupEmail, setNeedsBackupEmail] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const adminMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const sync = () => {
      const logged = isLoggedIn();
      setLoggedIn(logged);

      if (!logged) {
        setRole(null);
        setNeedsBackupEmail(false);
        setAdminMenuOpen(false);
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

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
    setRole(null);
    setNeedsBackupEmail(false);
    setAdminMenuOpen(false);
    router.push("/");
  }

  const link = "text-ink hover:text-brand-darker transition-colors";
  const isManager = role === "ADMIN" || role === "FACULTY";

  const adminLinks = [
    { href: "/admin/moderation", label: "Kiểm duyệt" },
    { href: "/admin/offerings", label: "Lần mở lớp" },
    { href: "/admin/catalog", label: "Nhập môn học" },
    { href: "/admin/knowledge", label: "Kho tri thức" },
    { href: "/admin/unanswered", label: "Câu hỏi chưa trả lời" },
    { href: "/admin/alumni", label: "Duyệt alumni" },
    { href: "/admin/users", label: "Người dùng" },
    { href: "/admin/graduation", label: "Tốt nghiệp" },
    { href: "/admin/timeline", label: "Sửa dòng thời gian" },
    { href: "/admin/forum", label: "Kiểm duyệt diễn đàn" },
  ];

  return (
    <header className="relative z-50">
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 px-8 py-4 bg-white border-b border-brand-light">
        <Link
          href="/"
          className="font-bold text-lg text-brand-darker"
        >
          FIThread
        </Link>

        <Link href="/courses" className={link}>
          Môn học
        </Link>

        <Link href="/alumni" className={link}>
          Alumni
        </Link>

        <Link href="/timeline" className={link}>
          Dòng thời gian
        </Link>

        {loggedIn && (
          <Link href="/forum" className={link}>
            Diễn đàn
          </Link>
        )}

        {isManager && (
          <Link href="/dashboard" className={link}>
            Dashboard
          </Link>
        )}

        {role === "ALUMNI" && (
          <Link href="/alumni/me" className={link}>
            Hồ sơ của tôi
          </Link>
        )}

        {/* Dropdown dành riêng cho ADMIN */}
        {role === "ADMIN" && (
          <div className="relative" ref={adminMenuRef}>
            <button
              type="button"
              onClick={() => setAdminMenuOpen((prev) => !prev)}
              aria-expanded={adminMenuOpen}
              aria-haspopup="true"
              className={`flex items-center gap-2 ${link} font-medium`}
            >
              Quản trị
              <svg
                className={`h-4 w-4 transition-transform ${
                  adminMenuOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {adminMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-brand-light bg-white py-2 shadow-lg">
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Quản lý hệ thống
                </p>

                {adminLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setAdminMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-brand-light hover:text-brand-darker"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="flex-1" />

        {loggedIn && (
          <Link href="/account" className={link}>
            Tài khoản
          </Link>
        )}

        {loggedIn ? (
          <button onClick={handleLogout} className={link}>
            Đăng xuất
          </button>
        ) : (
          <Link href="/login" className={link}>
            Đăng nhập
          </Link>
        )}
      </nav>

      {needsBackupEmail && (
        <div className="bg-brand-light px-8 py-2 text-sm">
          Bạn cần bổ sung email dự phòng cá nhân (xác thực bằng mã OTP) để
          hoàn tất hồ sơ cựu sinh viên và xuất hiện trong danh bạ.{" "}
          <Link href="/account" className="link-brand font-medium">
            Bổ sung ngay
          </Link>
        </div>
      )}
    </header>
  );
}
