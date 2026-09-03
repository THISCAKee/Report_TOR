"use client";

import { useEffect, useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { DailyLogDialog } from "@/components/DailyLogDialog";
import { EntryForm } from "@/components/EntryForm";
import { Calendar } from "@/components/Calendar";
import { SummaryStrip } from "@/components/SummaryStrip";
import { WorkloadList } from "@/components/WorkloadList";
import { WorkloadEditor } from "@/components/WorkloadEditor";
import { WorkloadCreateDialog } from "@/components/WorkloadCreateDialog";
import { WorkloadLogsDialog } from "@/components/WorkloadLogsDialog";
import { WorkspaceGrid } from "@/components/WorkspaceGrid";
import { getNextIsoDate, getTodayIso, formatThaiDate } from "@/lib/format";
import { getWordExportStatusText, type WordExportStatus } from "@/lib/export-status";
import { getStoredLogs } from "@/lib/storage";
import type { EvaluationCycle, WorkLog, WorkLogDraft, WorkloadCreateDraft, WorkloadDefinition, WorkloadEditDraft } from "@/lib/types";
import { getLogsForDate } from "@/lib/work-log-insights";
import { filterLogsByEvaluationCycle, filterLogsByWorkCycleAndWorkload, getWorkCycle, getWorkCycleForNumber } from "@/lib/work-cycles";
import { buildWorkCycleWordDocument, ensureWordImageDimensions } from "@/lib/word-export";
import { createClient } from "@/lib/supabase/client";
import { deleteWorkLog, fetchWorkLogs, saveWorkLog } from "@/lib/supabase/work-logs";
import { createWorkload, deleteWorkload, fetchWorkloads, updateWorkload } from "@/lib/supabase/workloads";

const waitForExportUpdate = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0));

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(getTodayIso);
  const [selectedMonth, setSelectedMonth] = useState(() => getTodayIso().slice(0, 7));
  const [selectedEvaluationCycle, setSelectedEvaluationCycle] = useState<EvaluationCycle>(() => getWorkCycle(getTodayIso()).number);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [workloads, setWorkloads] = useState<WorkloadDefinition[]>([]);
  const [editingLog, setEditingLog] = useState<WorkLog>();
  const [duplicatingLog, setDuplicatingLog] = useState<WorkLog>();
  const [editingWorkload, setEditingWorkload] = useState<WorkloadDefinition>();
  const [isWorkloadCreateOpen, setIsWorkloadCreateOpen] = useState(false);
  const [viewingWorkload, setViewingWorkload] = useState<WorkloadDefinition>();
  const [selectedWorkloadId, setSelectedWorkloadId] = useState("");
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [legacyCount, setLegacyCount] = useState(0);
  const [exportStatus, setExportStatus] = useState<WordExportStatus>("idle");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => { void Promise.all([fetchWorkLogs(supabase), fetchWorkloads(supabase)]).then(([nextLogs, nextWorkloads]) => { setLogs(nextLogs); setWorkloads(nextWorkloads); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ")).finally(() => setLoading(false)); setLegacyCount(getStoredLogs().length); }, [supabase]);

  const dailyLogs = useMemo(() => getLogsForDate(logs, selectedDate), [logs, selectedDate]);
  const workCycle = useMemo(() => getWorkCycleForNumber(selectedMonth, selectedEvaluationCycle), [selectedMonth, selectedEvaluationCycle]);
  const fileCount = dailyLogs.reduce((count, log) => count + log.attachments.length, 0);

  const handleSave = async (draft: WorkLogDraft) => {
    try { await saveWorkLog(supabase, draft, editingLog); setLogs(await fetchWorkLogs(supabase)); setSelectedDate(draft.date); setSelectedMonth(draft.date.slice(0, 7)); setSelectedEvaluationCycle(draft.evaluationCycle); setEditingLog(undefined); setDuplicatingLog(undefined); setIsEntryOpen(false); setNotice(editingLog ? "แก้ไขรายการเรียบร้อยแล้ว" : duplicatingLog ? "ทำซ้ำรายการเรียบร้อยแล้ว" : "บันทึกภาระงานเรียบร้อยแล้ว"); window.setTimeout(() => setNotice(""), 3000); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (ids: string[]) => {
    const targets = logs.filter((log) => ids.includes(log.id));
    if (!targets.length) return;
    try {
      await Promise.all(targets.map((target) => deleteWorkLog(supabase, target)));
      setLogs(await fetchWorkLogs(supabase));
      setNotice(`ลบบันทึก ${targets.length} รายการเรียบร้อยแล้ว`);
      window.setTimeout(() => setNotice(""), 3000);
      if (editingLog && ids.includes(editingLog.id)) { setEditingLog(undefined); setIsEntryOpen(false); }
      if (duplicatingLog && ids.includes(duplicatingLog.id)) setDuplicatingLog(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ลบข้อมูลไม่สำเร็จ");
      throw reason;
    }
  };

  const handleEditWorkload = (workload: WorkloadDefinition) => {
    setError("");
    setEditingWorkload(workload);
  };

  const handleCreateWorkload = async (draft: WorkloadCreateDraft) => {
    try {
      setError("");
      const created = await createWorkload(supabase, draft);
      setWorkloads(await fetchWorkloads(supabase));
      setSelectedWorkloadId(created.id);
      setIsWorkloadCreateOpen(false);
      setNotice(`เพิ่ม TOR ${created.code} เรียบร้อยแล้ว`);
      window.setTimeout(() => setNotice(""), 3000);
    } catch (reason) {
      throw reason instanceof Error ? reason : new Error("เพิ่มรายการ TOR ไม่สำเร็จ");
    }
  };

  const handleUpdateWorkload = async (draft: WorkloadEditDraft) => {
    if (!editingWorkload) return;
    try {
      await updateWorkload(supabase, editingWorkload.id, draft);
      setWorkloads(await fetchWorkloads(supabase));
      setEditingWorkload(undefined);
      setNotice("แก้ไขหัวข้อ TOR เรียบร้อยแล้ว");
      window.setTimeout(() => setNotice(""), 3000);
    } catch (reason) {
      throw reason instanceof Error ? reason : new Error("แก้ไขข้อมูล TOR ไม่สำเร็จ");
    }
  };

  const handleDeleteWorkload = async (workload: WorkloadDefinition) => {
    const relatedCount = logs.filter((log) => log.workloadId === workload.id).length;
    const warning = relatedCount ? `TOR ${workload.code} มีบันทึกงาน ${relatedCount} รายการและไฟล์แนบที่เกี่ยวข้อง ข้อมูลทั้งหมดจะถูกลบถาวร ต้องการดำเนินการต่อหรือไม่?` : `ต้องการลบ TOR ${workload.code} ${workload.title} ออกจากฐานข้อมูลถาวรหรือไม่?`;
    if (!window.confirm(warning)) return;
    try {
      setError("");
      await deleteWorkload(supabase, workload.id);
      const [nextLogs, nextWorkloads] = await Promise.all([fetchWorkLogs(supabase), fetchWorkloads(supabase)]);
      setLogs(nextLogs);
      setWorkloads(nextWorkloads);
      if (selectedWorkloadId === workload.id) setSelectedWorkloadId("");
      if (editingLog?.workloadId === workload.id) { setEditingLog(undefined); setIsEntryOpen(false); }
      setNotice("ลบ TOR และข้อมูลที่เกี่ยวข้องถาวรเรียบร้อยแล้ว");
      window.setTimeout(() => setNotice(""), 3000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ลบข้อมูล TOR ไม่สำเร็จ");
    }
  };

  const handleSelectWorkload = (workloadId: string) => {
    setEditingLog(undefined);
    setDuplicatingLog(undefined);
    setIsEntryOpen(false);
    setSelectedWorkloadId(workloadId);
  };

  const handleEdit = (log: WorkLog) => {
    setDuplicatingLog(undefined);
    setEditingLog(log);
    setSelectedWorkloadId(log.workloadId);
    setSelectedEvaluationCycle(log.evaluationCycle);
    setIsEntryOpen(true);
  };

  const handleDuplicate = (log: WorkLog, targetDate: string) => {
    const nextDate = targetDate || getNextIsoDate(log.date);
    setEditingLog(undefined);
    setIsEntryOpen(false);
    setDuplicatingLog(log);
    setSelectedWorkloadId(log.workloadId);
    setSelectedDate(nextDate);
    setSelectedMonth(nextDate.slice(0, 7));
    setSelectedEvaluationCycle(log.evaluationCycle);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedMonth(date.slice(0, 7));
    setEditingLog(undefined);
    setDuplicatingLog(undefined);
  };

  const handleExportWorkCycleWorkload = async (workloadId: string) => {
    const workload = workloads.find((item) => item.id === workloadId);
    const workloadLogs = filterLogsByWorkCycleAndWorkload(filterLogsByEvaluationCycle(logs, selectedEvaluationCycle), workCycle.startDate, workloadId);
    if (!workload || !workloadLogs.length || exportStatus !== "idle") return;
    try {
      setError("");
      setExportStatus("preparing");
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      setExportStatus("compressing");
      const preparedLogs = await ensureWordImageDimensions(workloadLogs);
      setExportStatus("building");
      await waitForExportUpdate();
      const documentHtml = buildWorkCycleWordDocument(workCycle.startDate, workCycle.endDate, preparedLogs, [workload]);
      const blob = new Blob(["\ufeff", documentHtml], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `รายงาน-${workload.code}-รอบการทำงาน-${workCycle.number}-${workCycle.startDate}-${workCycle.endDate}.doc`;
      setExportStatus("downloading");
      await waitForExportUpdate();
      link.click();
      URL.revokeObjectURL(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ส่งออกไฟล์ไม่สำเร็จ");
    } finally {
      setExportStatus("idle");
    }
  };

  const handleLegacyImport = async () => {
    const legacyLogs = getStoredLogs();
    if (!legacyLogs.length || !window.confirm(`พบข้อมูลเดิม ${legacyLogs.length} รายการ ต้องการนำเข้าเข้าระบบหรือไม่?`)) return;
    try {
      for (const log of legacyLogs) {
        const files = await Promise.all(log.attachments.filter(file => file.dataUrl.startsWith("data:")).map(async file => { const response = await fetch(file.dataUrl); return new File([await response.blob()], file.name, { type: file.type }); }));
        await saveWorkLog(supabase, { date: log.date, workloadId: log.workloadId, evaluationCycle: log.evaluationCycle ?? getWorkCycle(log.date).number, detail: log.detail, notes: log.notes ?? "", quantity: log.quantity ?? "1", unit: log.unit ?? "รายการ", attachments: log.attachments, files });
      }
      setLogs(await fetchWorkLogs(supabase)); setLegacyCount(0); setNotice("นำเข้าข้อมูลเดิมเรียบร้อยแล้ว");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "นำเข้าข้อมูลไม่สำเร็จ"); }
  };

  if (loading) return <main className="grid min-h-screen place-items-center text-sm text-[var(--muted)]">กำลังโหลดข้อมูล…</main>;
  return <main className="min-h-screen pb-16">
    <AppFrame>
      <header className="flex flex-col gap-7 border-b border-[#d7d9de] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[var(--blue)]"><span className="h-px w-8 bg-[var(--gold)]" />TOR / DAILY LOG</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">สมุดบันทึกภาระงาน</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">บันทึกสิ่งที่ทำในแต่ละวันให้เป็นหลักฐาน ค้นหาและทบทวนได้ในที่เดียว</p></div>
        <div className="flex items-center gap-2 self-start rounded-full border border-[#dce0e7] bg-white/70 px-3 py-2 text-xs text-[var(--muted)] sm:self-auto"><span className="size-2 rounded-full bg-[var(--green)]" />ข้อมูลเก็บบนระบบ <button type="button" onClick={() => void supabase.auth.signOut().then(() => window.location.assign("/login"))} className="ml-2 font-semibold text-[var(--blue)]">ออกจากระบบ</button></div>
      </header>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d8def1] bg-[#f4f6ff] px-4 py-3.5"><div><p className="text-xs font-semibold text-[var(--muted)]">วันที่กำลังบันทึก</p><p className="mt-0.5 font-semibold">{formatThaiDate(selectedDate)}</p><p className="mt-1 text-xs text-[var(--muted)]">{selectedWorkloadId ? "เลือกรายการ TOR แล้ว" : "เลือกรายการ TOR จากฝั่งซ้าย"}</p></div><label className="flex items-center gap-2 text-sm font-semibold" htmlFor="selected-cycle"><span className="text-xs font-normal text-[var(--muted)]">รอบการประเมิน</span><select id="selected-cycle" value={selectedEvaluationCycle} onChange={(event) => setSelectedEvaluationCycle(Number(event.target.value) as EvaluationCycle)} className="focus-ring rounded-lg border border-[#cdd4e3] bg-white px-3 py-2 text-sm"><option value={1}>รอบที่ 1</option><option value={2}>รอบที่ 2</option></select></label></section>

      <div className="mt-6"><SummaryStrip date={selectedDate} logCount={dailyLogs.length} fileCount={fileCount} /></div>
      {notice ? <div role="status" className="mt-4 rounded-xl border border-[#b9dfd2] bg-[#effaf6] px-4 py-3 text-sm font-semibold text-[#246c59]">✓ {notice}</div> : null}
      {error ? <div role="alert" className="mt-4 rounded-xl border border-[#f2caca] bg-[#fff1f1] px-4 py-3 text-sm text-[var(--red)]">{error}</div> : null}
      {legacyCount ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ead7a1] bg-[#fff9e9] px-4 py-3 text-sm"><span>พบข้อมูลเดิมในเครื่อง {legacyCount} รายการ</span><button type="button" onClick={() => void handleLegacyImport()} className="rounded-lg bg-[var(--gold)] px-3 py-2 text-xs font-bold text-[#4a3511]">นำเข้าเข้าระบบ</button></div> : null}

      <WorkspaceGrid
        left={<WorkloadList className="mt-0 min-w-0" selectedId={editingLog?.workloadId ?? selectedWorkloadId} selectedCycle={workCycle} selectedEvaluationCycle={selectedEvaluationCycle} workloads={workloads} logs={logs} isExporting={exportStatus !== "idle"} onCreate={() => { setError(""); setIsWorkloadCreateOpen(true); }} onOpenLogs={(workload) => { setError(""); setViewingWorkload(workload); }} onSelect={handleSelectWorkload} onEdit={handleEditWorkload} onDelete={(workload) => void handleDeleteWorkload(workload)} onExportWorkCycle={(workloadId) => void handleExportWorkCycleWorkload(workloadId)}>
          {selectedWorkloadId && !editingLog ? <EntryForm selectedDate={selectedDate} selectedWorkloadId={selectedWorkloadId} selectedEvaluationCycle={selectedEvaluationCycle} workloads={workloads} duplicateLog={duplicatingLog} duplicateDate={duplicatingLog ? selectedDate : undefined} onSave={handleSave} onCancel={() => setDuplicatingLog(undefined)} /> : null}
        </WorkloadList>}
        middle={<Calendar month={selectedMonth} selectedDate={selectedDate} logs={logs} onSelectDate={handleSelectDate} onChangeMonth={setSelectedMonth} />}
        right={<DailyLogDialog inline date={selectedDate} logs={dailyLogs} workloads={workloads} onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete} onClose={() => undefined} />}
      />

      {exportStatus !== "idle" ? <div className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(23,35,63,.46)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="export-progress-title"><div className="w-full max-w-sm rounded-3xl bg-white px-6 py-7 text-center shadow-2xl"><div className="mx-auto grid size-14 place-items-center rounded-full bg-[#eef1ff]"><span className="size-7 animate-spin rounded-full border-4 border-[#cdd6ff] border-t-[var(--blue)]" aria-hidden="true" /></div><h2 id="export-progress-title" className="mt-5 text-lg font-semibold text-[var(--ink)]">{getWordExportStatusText(exportStatus)}</h2><p className="mt-2 text-sm text-[var(--muted)]">โปรดรอสักครู่ ระบบกำลังเตรียมไฟล์ให้ดาวน์โหลด</p></div></div> : null}
      {isEntryOpen ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(23,35,63,.42)] p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setIsEntryOpen(false); setEditingLog(undefined); } }}><div role="dialog" aria-modal="true" aria-labelledby="entry-dialog-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[var(--paper)] p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mb-4 flex justify-end"><button type="button" onClick={() => { setIsEntryOpen(false); setEditingLog(undefined); }} className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[#e9e8e2]">ปิดหน้าต่าง</button></div><div id="entry-dialog-title" className="sr-only">กรอกข้อมูลภาระงาน</div><EntryForm selectedDate={selectedDate} selectedWorkloadId={selectedWorkloadId} selectedEvaluationCycle={selectedEvaluationCycle} workloads={workloads} initialLog={editingLog} onSave={handleSave} onCancel={() => { setIsEntryOpen(false); setEditingLog(undefined); }} /></div></div> : null}
      {editingWorkload ? <WorkloadEditor workload={editingWorkload} onSave={handleUpdateWorkload} onCancel={() => setEditingWorkload(undefined)} /> : null}
      {isWorkloadCreateOpen ? <WorkloadCreateDialog onSave={handleCreateWorkload} onCancel={() => setIsWorkloadCreateOpen(false)} /> : null}
      {viewingWorkload ? <WorkloadLogsDialog workload={viewingWorkload} logs={logs.filter((log) => log.workloadId === viewingWorkload.id)} onDelete={handleDelete} onClose={() => setViewingWorkload(undefined)} /> : null}
    </AppFrame>
  </main>;
}
