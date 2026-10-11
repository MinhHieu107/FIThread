import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FIThread",
  description: "Đánh giá môn học, kết nối alumni và chatbot hỏi đáp - Khoa CNTT, Đại học Hà Nội",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}