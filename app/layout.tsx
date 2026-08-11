import type { Metadata } from "next";
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
