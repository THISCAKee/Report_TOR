import type { Metadata } from "next";
// @ts-expect-error The CSS module is processed by Next.js at build time.
import "./globals.css";

export const metadata: Metadata = {
  title: "สมุดบันทึกภาระงาน | TOR",
  description: "บันทึกภาระงานรายวันตามข้อตกลง TOR",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
