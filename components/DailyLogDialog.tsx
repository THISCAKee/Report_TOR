"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyLog } from "@/components/DailyLog";
import { formatThaiDate, getNextIsoDate } from "@/lib/format";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";
import { selectAllLogIds, toggleSelectedLogId } from "@/lib/work-log-selection";

type Props = {
  inline?: boolean;
  date: string;
  logs: WorkLog[];
  workloads: WorkloadDefinition[];
  onEdit: (log: WorkLog) => void;
  onDuplicate: (log: WorkLog, targetDate: string) => void;
  onDelete: (ids: string[]) => Promise<void>;
  onClose: () => void;
};

export function DailyLogDialog({ inline = false, date, logs, workloads, onEdit, onDuplicate, onDelete, onClose }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [duplicateDate, setDuplicateDate] = useState(() => getNextIsoDate(date));
  const allSelected = logs.length > 0 && selectedIds.size === logs.length;
  const selectedLogs = useMemo(() => logs.filter((log) => selectedIds.has(log.id)), [logs, selectedIds]);
  const selectedFileCount = selectedLogs.reduce((count, log) => count + log.attachments.length, 0);

  useEffect(() => {
    const visibleIds = new Set(logs.map((log) => log.id));
    setSelectedIds((current) => new Set([...current].filter((id) => visibleIds.has(id))));
  }, [logs]);

  useEffect(() => {
    setDuplicateDate(getNextIsoDate(date));
  }, [date]);

  const deleteSelected = async () => {
    if (!selectedLogs.length) return;
    const fileText = selectedFileCount ? ` และไฟล์แนบ ${selectedFileCount} ไฟล์` : "";
    if (!window.confirm(`ต้องการลบบันทึกที่เลือก ${selectedLogs.length} รายการ${fileText} ออกจากฐานข้อมูลถาวรหรือไม่?`)) return;
    setDeleting(true);
    try {
      await onDelete(selectedLogs.map((log) => log.id));
      setSelectedIds(new Set());
    } finally {
      setDeleting(false);
    }
  };

  const headingId = inline ? "daily-log-panel-title" : "daily-log-dialog-title";
  const content = <>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--gold)]">รายการที่บันทึกไว้</p><h2 id={headingId} className="mt-1 text-2xl font-semibold tracking-tight">{formatThaiDate(date)}</h2><p className="mt-1 text-sm text-[var(--muted)]">ทั้งหมด {logs.length} รายการ</p></div>
      {inline ? null : <button type="button" onClick={onClose} className="focus-ring rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#eef1f8]">ปิดหน้าต่าง</button>}
    </div>
    {logs.length ? <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#b9dfd2] bg-[#effaf6] px-4 py-3"><div><p className="text-sm font-semibold text-[#246c59]">ทำซ้ำรายการไปวันที่</p><p className="mt-0.5 text-xs text-[#4f806f]">เลือกวันปลายทาง แล้วกด “ทำซ้ำรายการ” ในแถวที่ต้องการ</p></div><label className="flex items-center gap-2 text-sm font-semibold text-[#246c59]" htmlFor="duplicate-date"><span className="sr-only">วันที่สำหรับทำซ้ำ</span><input id="duplicate-date" aria-label="วันที่สำหรับทำซ้ำ" type="date" value={duplicateDate} onChange={(event) => setDuplicateDate(event.target.value)} className="focus-ring rounded-lg border border-[#9fd4c0] bg-white px-3 py-2 text-sm text-[var(--ink)]" /></label></div> : null}
    {logs.length ? <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3"><label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(selectAllLogIds(logs.map((log) => log.id), event.target.checked))} className="focus-ring size-4 accent-[var(--red)]" />เลือกทั้งหมด</label><div className="flex items-center gap-3"><span className="text-sm text-[var(--muted)]">เลือกแล้ว {selectedIds.size} รายการ</span><button type="button" disabled={!selectedIds.size || deleting} onClick={() => void deleteSelected()} className="focus-ring rounded-lg border border-[#e6bcbc] bg-[#fff6f6] px-3.5 py-2 text-sm font-semibold text-[var(--red)] transition hover:bg-[#ffeaea] disabled:cursor-not-allowed disabled:opacity-45">{deleting ? "กำลังลบ…" : "ลบรายการที่เลือก"}</button></div></div> : null}
    <DailyLog date={date} logs={logs} workloads={workloads} showHeader={false} selectedIds={selectedIds} onToggleSelection={(id) => setSelectedIds((current) => toggleSelectedLogId(current, id))} onEdit={onEdit} onDuplicate={(log) => onDuplicate(log, duplicateDate)} />
  </>;

  if (inline) return <section aria-labelledby={headingId} className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(23,35,63,.06)] sm:p-6">{content}</section>;
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(23,35,63,.46)] p-0 backdrop-blur-[3px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby={headingId} className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-t-3xl bg-[var(--paper)] p-5 shadow-2xl sm:rounded-3xl sm:p-7">{content}</div></div>;
}
