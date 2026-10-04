"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/api";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
    router.push("/");
  }

  return (
    <nav className="flex items-center gap-6 px-8 py-4 bg-white border-b border-gray-200">
      <Link href="/" className="font-bold text-lg text-brand-dark">FIThread</Link>
      <Link href="/courses" className="text-gray-700 hover:text-brand-dark">Môn học</Link>
      <Link href="/alumni" className="text-gray-700 hover:text-brand-dark">Alumni</Link>
      <Link href="/timeline" className="text-gray-700 hover:text-brand-dark">Dòng thời gian</Link>
      <span className="flex-1" />
      {loggedIn ? (
        <button onClick={handleLogout} className="text-gray-700 hover:text-brand-dark">
          Đăng xuất
        </button>
      ) : (
        <Link href="/login" className="text-gray-700 hover:text-brand-dark">Đăng nhập</Link>
      )}
    </nav>
  );
}