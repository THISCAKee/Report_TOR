import type { ReactNode } from "react";
import type { EvaluationCycle, WorkLog, WorkloadDefinition } from "@/lib/types";
import { WORKLOAD_CATEGORIES } from "@/lib/workload-data";
import { filterLogsByEvaluationCycle, filterLogsByWorkCycleAndWorkload } from "@/lib/work-cycles";
import type { WorkCycle } from "@/lib/work-cycles";

type Props = {
  className?: string;
  children?: ReactNode;
  selectedId: string;
  selectedCycle: WorkCycle;
  selectedEvaluationCycle: EvaluationCycle;
  workloads: WorkloadDefinition[];
  logs: WorkLog[];
  isExporting: boolean;
  onCreate: () => void;
  onOpenLogs: (workload: WorkloadDefinition) => void;
  onSelect: (workloadId: string) => void;
  onEdit: (workload: WorkloadDefinition) => void;
  onDelete: (workload: WorkloadDefinition) => void;
  onExportWorkCycle: (workloadId: string) => void;
};

export function WorkloadList({ className = "", children, selectedId, selectedCycle, selectedEvaluationCycle, workloads, logs, isExporting, onCreate, onOpenLogs, onSelect, onEdit, onDelete, onExportWorkCycle }: Props) {
  const cycleLogs = filterLogsByEvaluationCycle(logs, selectedEvaluationCycle);
  const selectedWorkload = workloads.find((workload) => workload.id === selectedId);
  const selectedLogCount = selectedWorkload ? logs.filter((log) => log.workloadId === selectedWorkload.id).length : 0;
  const selectedCycleCount = selectedWorkload ? filterLogsByWorkCycleAndWorkload(cycleLogs, selectedCycle.startDate, selectedWorkload.id).length : 0;

  return (
    <section aria-labelledby="workload-list-title" className={`rounded-3xl border border-[var(--line)] bg-white/75 p-4 shadow-[0_18px_50px_rgba(23,35,63,.05)] sm:p-5 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-2">
        <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--blue)]">เลือกจาก TOR</p><h2 id="workload-list-title" className="mt-1 text-lg font-semibold tracking-tight">รายการ TOR</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">เลือกหัวข้องาน แล้วเลือกวันที่</p></div>
        <div className="flex shrink-0 flex-col items-end gap-2"><span className="rounded-full bg-[#f0f2f7] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]">{workloads.length} รายการ</span><button type="button" onClick={onCreate} className="focus-ring rounded-lg bg-[var(--blue)] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_6px_14px_rgba(47,86,211,.18)] transition hover:bg-[#2548b5]">＋ เพิ่ม TOR</button></div>
      </div>
      <div className="space-y-4">
        <label className="block" htmlFor="workload-picker">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">หัวข้องาน</span>
          <select id="workload-picker" aria-label="เลือกรายการ TOR" value={selectedId} onChange={(event) => onSelect(event.target.value)} className="focus-ring w-full rounded-xl border border-[#cdd4e3] bg-white px-3 py-3 text-sm font-semibold text-[var(--ink)] shadow-[0_5px_14px_rgba(23,35,63,.04)]">
            <option value="">เลือกหัวข้องานจาก TOR</option>
            {WORKLOAD_CATEGORIES.map((category) => {
              const categoryWorkloads = workloads.filter((workload) => workload.category === category);
              if (!categoryWorkloads.length) return null;
              return <optgroup key={category} label={category}>{categoryWorkloads.map((workload) => <option key={workload.id} value={workload.id}>{workload.code} — {workload.title}</option>)}</optgroup>;
            })}
          </select>
        </label>

        {selectedWorkload ? <div className="rounded-2xl border border-[var(--blue)] bg-[#f1f4ff] p-3.5 shadow-[0_8px_20px_rgba(47,86,211,.08)]">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-bold text-[var(--blue)]">{selectedWorkload.code}</span>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold leading-5 text-[var(--ink)]">{selectedWorkload.title}</p><p className="mt-1 text-[11px] text-[var(--muted)]">น้ำหนัก {selectedWorkload.weight}% · บันทึกแล้ว {selectedLogCount}</p></div>
            <button type="button" onClick={() => onOpenLogs(selectedWorkload)} aria-label={`ดูรายการที่บันทึกของ TOR ${selectedWorkload.code}`} className="focus-ring shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--blue)] transition hover:bg-[#e4eaff]">ดูบันทึก</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5"><button type="button" onClick={() => onEdit(selectedWorkload)} className="focus-ring flex-1 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ink)] transition hover:bg-[#eef1f8]">แก้ไข</button><button type="button" onClick={() => onDelete(selectedWorkload)} className="focus-ring rounded-lg border border-[#edcaca] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--red)] transition hover:bg-[#fff1f1]">ลบ</button><button type="button" onClick={() => onExportWorkCycle(selectedWorkload.id)} disabled={!selectedCycleCount || isExporting} className="focus-ring rounded-lg border border-[var(--ink)] bg-white px-2 py-1.5 text-[11px] font-semibold text-[var(--ink)] transition hover:bg-[#eef1f8] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)] disabled:opacity-55" aria-label={`ดาวน์โหลดรายงาน Word ${selectedWorkload.code} ${selectedWorkload.title}`}>Word <span className="font-normal">({selectedCycleCount})</span></button></div>
        </div> : <div role="status" className="rounded-2xl border border-dashed border-[#cdd4e3] bg-[#fafbfe] px-4 py-5 text-center text-xs leading-5 text-[var(--muted)]">ยังไม่ได้เลือกหัวข้องาน<br /><span className="text-[11px]">เลือกจาก dropdown เพื่อเริ่มบันทึกภาระงาน</span></div>}
        {selectedWorkload && children ? <div className="border-t border-[#d8def1] pt-5">{children}</div> : null}
      </div>
    </section>
  );
}
