"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyLog } from "@/components/DailyLog";
import { EntryForm } from "@/components/EntryForm";
import { SummaryStrip } from "@/components/SummaryStrip";
import { WorkloadList } from "@/components/WorkloadList";
import { getTodayIso, formatThaiDate } from "@/lib/format";
import { getStoredLogs } from "@/lib/storage";
import type { WorkLog, WorkLogDraft } from "@/lib/types";
import { WORKLOADS } from "@/lib/workload-data";
import { buildWordDocument, ensureWordImageDimensions } from "@/lib/word-export";
import { createClient } from "@/lib/supabase/client";
import { deleteWorkLog, fetchWorkLogs, saveWorkLog } from "@/lib/supabase/work-logs";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(getTodayIso);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [editingLog, setEditingLog] = useState<WorkLog>();
  const [selectedWorkloadId, setSelectedWorkloadId] = useState("");
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [legacyCount, setLegacyCount] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => { void fetchWorkLogs(supabase).then(setLogs).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ")).finally(() => setLoading(false)); setLegacyCount(getStoredLogs().length); }, [supabase]);

  const dailyLogs = useMemo(() => logs.filter((log) => log.date === selectedDate), [logs, selectedDate]);
  const monthlyLogs = useMemo(() => logs.filter((log) => log.date.startsWith(selectedDate.slice(0, 7))), [logs, selectedDate]);
  const fileCount = dailyLogs.reduce((count, log) => count + log.attachments.length, 0);

  const handleSave = async (draft: WorkLogDraft) => {
    try { await saveWorkLog(supabase, draft, editingLog); setLogs(await fetchWorkLogs(supabase)); setSelectedDate(draft.date); setEditingLog(undefined); setIsEntryOpen(false); setNotice(editingLog ? "แก้ไขรายการเรียบร้อยแล้ว" : "บันทึกภาระงานเรียบร้อยแล้ว"); window.setTimeout(() => setNotice(""), 3000); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    const target = logs.find((log) => log.id === id);
    if (!target || !window.confirm("ต้องการลบรายการภาระงานนี้ใช่หรือไม่?")) return;
    try { await deleteWorkLog(supabase, target); setLogs(await fetchWorkLogs(supabase)); setNotice("ลบรายการเรียบร้อยแล้ว"); } catch (reason) { setError(reason instanceof Error ? reason.message : "ลบข้อมูลไม่สำเร็จ"); }
    if (editingLog?.id === id) { setEditingLog(undefined); setIsEntryOpen(false); }
  };

  const handleSelectWorkload = (workloadId: string) => {
    setEditingLog(undefined);
    setSelectedWorkloadId(workloadId);
    setIsEntryOpen(true);
  };

  const handleEdit = (log: WorkLog) => {
    setEditingLog(log);
    setSelectedWorkloadId(log.workloadId);
    setIsEntryOpen(true);
  };

  const handleExportWord = async () => {
    const preparedLogs = await ensureWordImageDimensions(monthlyLogs);
    const documentHtml = buildWordDocument(selectedDate, preparedLogs, WORKLOADS);
    const blob = new Blob(["\ufeff", documentHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `บันทึกประจำวัน-${selectedDate.slice(0, 7)}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLegacyImport = async () => {
    const legacyLogs = getStoredLogs();
    if (!legacyLogs.length || !window.confirm(`พบข้อมูลเดิม ${legacyLogs.length} รายการ ต้องการนำเข้าเข้าระบบหรือไม่?`)) return;
    try {
      for (const log of legacyLogs) {
        const files = await Promise.all(log.attachments.filter(file => file.dataUrl.startsWith("data:")).map(async file => { const response = await fetch(file.dataUrl); return new File([await response.blob()], file.name, { type: file.type }); }));
        await saveWorkLog(supabase, { date: log.date, workloadId: log.workloadId, detail: log.detail, notes: log.notes ?? "", quantity: log.quantity ?? "1", unit: log.unit ?? "รายการ", attachments: log.attachments, files });
      }
      setLogs(await fetchWorkLogs(supabase)); setLegacyCount(0); setNotice("นำเข้าข้อมูลเดิมเรียบร้อยแล้ว");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "นำเข้าข้อมูลไม่สำเร็จ"); }
  };

  if (loading) return <main className="grid min-h-screen place-items-center text-sm text-[var(--muted)]">กำลังโหลดข้อมูล…</main>;
  return <main className="min-h-screen pb-16">
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-7 border-b border-[#d7d9de] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[var(--blue)]"><span className="h-px w-8 bg-[var(--gold)]" />TOR / DAILY LOG</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">สมุดบันทึกภาระงาน</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">บันทึกสิ่งที่ทำในแต่ละวันให้เป็นหลักฐาน ค้นหาและทบทวนได้ในที่เดียว</p></div>
        <div className="flex items-center gap-2 self-start rounded-full border border-[#dce0e7] bg-white/70 px-3 py-2 text-xs text-[var(--muted)] sm:self-auto"><span className="size-2 rounded-full bg-[var(--green)]" />ข้อมูลเก็บบนระบบ <button type="button" onClick={() => void supabase.auth.signOut().then(() => window.location.assign("/login"))} className="ml-2 font-semibold text-[var(--blue)]">ออกจากระบบ</button></div>
      </header>

      <div className="mt-6"><SummaryStrip date={selectedDate} logCount={dailyLogs.length} fileCount={fileCount} /></div>
      {notice ? <div role="status" className="mt-4 rounded-xl border border-[#b9dfd2] bg-[#effaf6] px-4 py-3 text-sm font-semibold text-[#246c59]">✓ {notice}</div> : null}
      {error ? <div role="alert" className="mt-4 rounded-xl border border-[#f2caca] bg-[#fff1f1] px-4 py-3 text-sm text-[var(--red)]">{error}</div> : null}
      {legacyCount ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ead7a1] bg-[#fff9e9] px-4 py-3 text-sm"><span>พบข้อมูลเดิมในเครื่อง {legacyCount} รายการ</span><button type="button" onClick={() => void handleLegacyImport()} className="rounded-lg bg-[var(--gold)] px-3 py-2 text-xs font-bold text-[#4a3511]">นำเข้าเข้าระบบ</button></div> : null}

      <WorkloadList selectedId={editingLog?.workloadId ?? selectedWorkloadId} logs={logs} onSelect={handleSelectWorkload} />

      <section className="mt-6 rounded-3xl border border-[var(--line)] bg-white/45 p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#eef1f8] px-4 py-3"><div><span className="text-xs font-semibold text-[var(--muted)]">กำลังดูบันทึกของ</span><p className="mt-0.5 font-semibold">{formatThaiDate(selectedDate)}</p></div><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-sm font-semibold" htmlFor="view-date"><span className="sr-only">เปลี่ยนวันที่ดู</span><input id="view-date" type="date" value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setEditingLog(undefined); }} className="focus-ring rounded-lg border border-[#cdd4e3] bg-white px-3 py-2 text-sm" /></label><button type="button" onClick={handleExportWord} disabled={!monthlyLogs.length} className="focus-ring rounded-lg bg-[var(--ink)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#293a61] disabled:cursor-not-allowed disabled:opacity-40">ส่งออก Word รายเดือน</button></div></div><DailyLog date={selectedDate} logs={dailyLogs} onEdit={handleEdit} onDelete={handleDelete} /></section>

      {isEntryOpen ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(23,35,63,.42)] p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setIsEntryOpen(false); setEditingLog(undefined); } }}><div role="dialog" aria-modal="true" aria-labelledby="entry-dialog-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[var(--paper)] p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mb-4 flex justify-end"><button type="button" onClick={() => { setIsEntryOpen(false); setEditingLog(undefined); }} className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[#e9e8e2]">ปิดหน้าต่าง</button></div><div id="entry-dialog-title" className="sr-only">กรอกข้อมูลภาระงาน</div><EntryForm selectedDate={selectedDate} selectedWorkloadId={selectedWorkloadId} initialLog={editingLog} onSave={handleSave} onCancel={() => { setIsEntryOpen(false); setEditingLog(undefined); }} /></div></div> : null}
    </div>
  </main>;
}
