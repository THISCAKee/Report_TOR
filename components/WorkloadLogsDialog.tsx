"use client";

import { useEffect, useMemo, useState } from "react";
import { formatFileSize, formatThaiDate } from "@/lib/format";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";
import { selectAllLogIds, toggleSelectedLogId } from "@/lib/work-log-selection";

type Props = { workload: WorkloadDefinition; logs: WorkLog[]; onDelete: (ids: string[]) => Promise<void>; onClose: () => void };

export function WorkloadLogsDialog({ workload, logs, onDelete, onClose }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const allSelected = logs.length > 0 && selectedIds.size === logs.length;
  const selectedLogs = useMemo(() => logs.filter((log) => selectedIds.has(log.id)), [logs, selectedIds]);
  const fileCount = selectedLogs.reduce((count, log) => count + log.attachments.length, 0);

  useEffect(() => {
    const visibleIds = new Set(logs.map((log) => log.id));
    setSelectedIds((current) => new Set([...current].filter((id) => visibleIds.has(id))));
  }, [logs]);

  const deleteSelected = async () => {
    if (!selectedLogs.length) return;
    const filesText = fileCount ? ` และไฟล์แนบ ${fileCount} ไฟล์` : "";
    if (!window.confirm(`ต้องการลบบันทึกของ TOR ${workload.code} ที่เลือก ${selectedLogs.length} รายการ${filesText} ถาวรหรือไม่?`)) return;
    setDeleting(true);
    try {
      await onDelete(selectedLogs.map((log) => log.id));
      setSelectedIds(new Set());
    } finally {
      setDeleting(false);
    }
  };

  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(23,35,63,.46)] p-0 backdrop-blur-[3px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="workload-logs-dialog-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-[var(--paper)] p-5 shadow-2xl sm:rounded-3xl sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--gold)]">บันทึกของ TOR</p><h2 id="workload-logs-dialog-title" className="mt-1 text-xl font-semibold">{workload.code} {workload.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">ทั้งหมด {logs.length} รายการ · คลิกที่รายการเพื่อเลือก</p></div><button type="button" onClick={onClose} className="focus-ring rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[#eef1f8]">ปิด</button></div>
      {logs.length ? <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3"><label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(selectAllLogIds(logs.map((log) => log.id), event.target.checked))} className="focus-ring size-4 accent-[var(--red)]" />เลือกทั้งหมด</label><div className="flex items-center gap-3"><span className="text-sm text-[var(--muted)]">เลือกแล้ว {selectedIds.size}</span><button type="button" disabled={!selectedIds.size || deleting} onClick={() => void deleteSelected()} className="focus-ring rounded-lg border border-[#e6bcbc] bg-[#fff6f6] px-3.5 py-2 text-sm font-semibold text-[var(--red)] hover:bg-[#ffeaea] disabled:cursor-not-allowed disabled:opacity-45">{deleting ? "กำลังลบ…" : "ลบรายการที่เลือก"}</button></div></div> : null}
      {logs.length ? <div className="space-y-2">{logs.map((log) => { const selected = selectedIds.has(log.id); return <label key={log.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition ${selected ? "border-[#e6bcbc] bg-[#fff6f6]" : "border-[var(--line)] bg-white hover:border-[#c8d0e3]"}`}><input type="checkbox" checked={selected} onChange={() => setSelectedIds((current) => toggleSelectedLogId(current, log.id))} aria-label={`เลือกบันทึกวันที่ ${formatThaiDate(log.date)}`} className="focus-ring mt-1 size-4 shrink-0 accent-[var(--red)]" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--ink)]">{formatThaiDate(log.date)}</span><span className="mt-1 block whitespace-pre-wrap text-sm leading-6 text-[#4e5769]">{log.detail}</span><span className="mt-1 block text-xs text-[var(--muted)]">ไฟล์แนบ {log.attachments.length} ไฟล์ · {log.notes || "ไม่มีหมายเหตุ"}</span></span></label>; })}</div> : <div className="rounded-2xl border border-dashed border-[#c5cad5] px-5 py-14 text-center"><h3 className="font-semibold">TOR นี้ยังไม่มีรายการบันทึก</h3><p className="mt-1 text-sm text-[var(--muted)]">เมื่อมีการบันทึกงาน รายการจะแสดงที่นี่</p></div>}
    </div>
  </div>;
}
