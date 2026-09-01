import { Fragment } from "react";
import type { EvaluationCycle, WorkLog, WorkloadDefinition } from "@/lib/types";
import { WORKLOAD_CATEGORIES } from "@/lib/workload-data";
import { filterLogsByEvaluationCycle, filterLogsByWorkCycleAndWorkload } from "@/lib/work-cycles";
import type { WorkCycle } from "@/lib/work-cycles";

type Props = {
  className?: string;
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

export function WorkloadList({ className = "", selectedId, selectedCycle, selectedEvaluationCycle, workloads, logs, isExporting, onCreate, onOpenLogs, onSelect, onEdit, onDelete, onExportWorkCycle }: Props) {
  const cycleLogs = filterLogsByEvaluationCycle(logs, selectedEvaluationCycle);

  return (
    <section aria-labelledby="workload-list-title" className={`rounded-3xl border border-[var(--line)] bg-white/75 p-4 shadow-[0_18px_50px_rgba(23,35,63,.05)] sm:p-5 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-2">
        <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--blue)]">เลือกจาก TOR</p><h2 id="workload-list-title" className="mt-1 text-lg font-semibold tracking-tight">รายการ TOR</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">เลือกหัวข้องาน แล้วเลือกวันที่</p></div>
        <div className="flex shrink-0 flex-col items-end gap-2"><span className="rounded-full bg-[#f0f2f7] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]">{workloads.length} รายการ</span><button type="button" onClick={onCreate} className="focus-ring rounded-lg bg-[var(--blue)] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_6px_14px_rgba(47,86,211,.18)] transition hover:bg-[#2548b5]">＋ เพิ่ม TOR</button></div>
      </div>
      <div className="space-y-3">
        {WORKLOAD_CATEGORIES.map((category) => <Fragment key={category}>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#806323]"><span className="h-px flex-1 bg-[#eadfbe]" /><span>{category}</span><span className="h-px flex-1 bg-[#eadfbe]" /></div>
          <div className="space-y-2">
            {workloads.filter((workload) => workload.category === category).map((workload) => {
              const count = logs.filter((log) => log.workloadId === workload.id).length;
              const cycleCount = filterLogsByWorkCycleAndWorkload(cycleLogs, selectedCycle.startDate, workload.id).length;
              const active = selectedId === workload.id;
              return <div key={workload.id} className={`rounded-xl border p-2.5 transition ${active ? "border-[var(--blue)] bg-[#f1f4ff] shadow-[0_6px_16px_rgba(47,86,211,.1)]" : "border-[var(--line)] bg-white hover:border-[#c8d0e3]"}`}>
                <button type="button" onClick={() => onOpenLogs(workload)} aria-label={`ดูรายการที่บันทึกของ TOR ${workload.code}`} className="focus-ring flex w-full items-start gap-2 rounded-lg text-left hover:bg-[#f1f4ff]"><span className="mt-0.5 rounded-full bg-[#edf1ff] px-1.5 py-0.5 text-[11px] font-bold text-[var(--blue)]">{workload.code}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-5 text-[var(--ink)]">{workload.title}</span><span className="mt-0.5 block text-[11px] text-[var(--muted)]">น้ำหนัก {workload.weight}% · บันทึกแล้ว {count}</span></span></button>
                <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => onSelect(workload.id)} className={`focus-ring min-w-24 flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${active ? "bg-[var(--blue)] text-white" : "bg-[#edf1ff] text-[var(--blue)] hover:bg-[#dfe6ff]"}`}>{active ? "เลือกแล้ว" : "เลือกหัวข้อนี้"}</button><button type="button" onClick={() => onEdit(workload)} className="focus-ring rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ink)] transition hover:bg-[#eef1f8]">แก้ไข</button><button type="button" onClick={() => onDelete(workload)} className="focus-ring rounded-lg border border-[#edcaca] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--red)] transition hover:bg-[#fff1f1]">ลบ</button><button type="button" onClick={() => onExportWorkCycle(workload.id)} disabled={!cycleCount || isExporting} className="focus-ring rounded-lg border border-[var(--ink)] px-2 py-1.5 text-[11px] font-semibold text-[var(--ink)] transition hover:bg-[#eef1f8] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)] disabled:opacity-55" aria-label={`ดาวน์โหลดรายงาน Word ${workload.code} ${workload.title}`}>Word <span className="font-normal">({cycleCount})</span></button></div>
              </div>;
            })}
          </div>
        </Fragment>)}
      </div>
    </section>
  );
}
