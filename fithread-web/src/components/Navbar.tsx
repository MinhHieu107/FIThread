"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/api";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

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

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
    router.push("/");
  }

  return (
    <nav className="flex items-center gap-6 px-8 py-4 bg-white border-b border-brand-light">
      <Link href="/" className="font-bold text-lg text-brand-darker">FIThread</Link>
      <Link href="/courses" className="text-ink hover:text-brand-darker">Môn học</Link>
      <Link href="/alumni" className="text-ink hover:text-brand-darker">Alumni</Link>
      <Link href="/timeline" className="text-ink hover:text-brand-darker">Dòng thời gian</Link>
      <span className="flex-1" />
      {loggedIn ? (
        <button onClick={handleLogout} className="text-ink hover:text-brand-darker">
          Đăng xuất
        </button>
      ) : (
        <Link href="/login" className="text-ink hover:text-brand-darker">Đăng nhập</Link>
      )}
    </nav>
  );
}