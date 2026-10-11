"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
  getCurrentUser().then((user) => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "ADMIN") {
      router.push("/");
    } else {
      setAllowed(true);
    }
    setChecked(true);
  });
}, [router]);

  if (!checked) return <main className="max-w-3xl mx-auto px-4 py-12">Đang kiểm tra quyền truy cập...</main>;
  if (!allowed) return null;

  return <>{children}</>;
}