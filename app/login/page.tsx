"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usernameToAuthEmail } from "@/lib/supabase/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const { error: signInError } = await createClient().auth.signInWithPassword({ email: usernameToAuthEmail(username), password });
    if (signInError) setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    else window.location.assign("/");
    setLoading(false);
  }
  return <main className="grid min-h-screen place-items-center px-4 py-10"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-7 shadow-xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--blue)]">TOR / DAILY LOG</p><h1 className="mt-3 text-3xl font-semibold">เข้าสู่ระบบ</h1><p className="mt-2 text-sm leading-6 text-[var(--muted)]">สำหรับผู้ใช้งานระบบบันทึกภาระงาน</p><label className="mt-7 block text-sm font-semibold">ชื่อผู้ใช้<input type="text" required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3" placeholder="เช่น earthcake" /></label><label className="mt-4 block text-sm font-semibold">รหัสผ่าน<input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3" /></label>{error ? <p role="alert" className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-3 text-sm text-[var(--red)]">{error}</p> : null}<button disabled={loading} className="mt-6 w-full rounded-xl bg-[var(--blue)] px-5 py-3 font-semibold text-white disabled:opacity-60">{loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button></form></main>;
}
