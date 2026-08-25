import { Fragment } from "react";
import type { WorkLog } from "@/lib/types";
import { WORKLOAD_CATEGORIES, WORKLOADS } from "@/lib/workload-data";
import { filterLogsByWorkCycleAndWorkload } from "@/lib/work-cycles";
import type { WorkCycle } from "@/lib/work-cycles";

type Props = {
  selectedId: string;
  selectedCycle: WorkCycle;
  logs: WorkLog[];
  isExporting: boolean;
  onSelect: (workloadId: string) => void;
  onExportWorkCycle: (workloadId: string) => void;
};

export function WorkloadList({ selectedId, selectedCycle, logs, isExporting, onSelect, onExportWorkCycle }: Props) {
  return (
    <section aria-labelledby="workload-list-title" className="mt-6 rounded-3xl border border-[var(--line)] bg-white/75 p-5 shadow-[0_18px_50px_rgba(23,35,63,.05)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--blue)]">เลือกจาก TOR</p><h2 id="workload-list-title" className="mt-1 text-xl font-semibold tracking-tight">รายการภาระงาน</h2><p className="mt-1 text-sm text-[var(--muted)]">เลือกแถวที่ต้องการ เพื่อเพิ่มรายละเอียดการทำงาน</p></div>
        <span className="rounded-full bg-[#f0f2f7] px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">{WORKLOADS.length} รายการ</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <caption className="sr-only">รายการภาระงานจากเอกสาร TOR</caption>
            <thead className="bg-[#eef1f8] text-xs font-bold text-[var(--muted)]"><tr><th className="w-24 px-4 py-3.5">รหัส</th><th className="px-4 py-3.5">หัวข้องาน</th><th className="w-28 px-4 py-3.5">น้ำหนัก</th><th className="w-36 px-4 py-3.5">บันทึกแล้ว</th><th className="w-32 px-4 py-3.5">เลือก</th><th className="w-44 px-4 py-3.5">รายงานรอบการทำงาน</th></tr></thead>
            <tbody className="divide-y divide-[var(--line)]">
              {WORKLOAD_CATEGORIES.map((category) => <Fragment key={category}><tr className="bg-[#faf9f5]"><th colSpan={6} className="px-4 py-2.5 text-xs font-bold text-[#806323]">{category}</th></tr>{WORKLOADS.filter((workload) => workload.category === category).map((workload) => { const count = logs.filter((log) => log.workloadId === workload.id).length; const cycleCount = filterLogsByWorkCycleAndWorkload(logs, selectedCycle.startDate, workload.id).length; const active = selectedId === workload.id; return <tr key={workload.id} className={`transition ${active ? "bg-[#f1f4ff]" : "bg-white hover:bg-[#fbfcff]"}`}><td className="px-4 py-3.5"><span className="rounded-full bg-[#edf1ff] px-2.5 py-1 text-xs font-bold text-[var(--blue)]">{workload.code}</span></td><td className="px-4 py-3.5 font-semibold leading-6 text-[var(--ink)]">{workload.title}</td><td className="px-4 py-3.5 text-[var(--muted)]">{workload.weight}%</td><td className="px-4 py-3.5">{count ? <span className="font-semibold text-[var(--green)]">{count} รายการ</span> : <span className="text-[var(--muted)]">ยังไม่มี</span>}</td><td className="px-4 py-3.5"><button type="button" onClick={() => onSelect(workload.id)} className={`focus-ring rounded-xl px-3 py-2 text-xs font-semibold transition ${active ? "bg-[var(--blue)] text-white" : "bg-[#edf1ff] text-[var(--blue)] hover:bg-[#dfe6ff]"}`}>{active ? "กำลังเพิ่มข้อมูล" : "เพิ่มข้อมูล"}</button></td><td className="px-4 py-3.5"><button type="button" onClick={() => onExportWorkCycle(workload.id)} disabled={!cycleCount || isExporting} aria-label={`ดาวน์โหลดรายงาน Word รอบการทำงานของ ${workload.code} ${workload.title}`} className="focus-ring w-full rounded-xl border border-[var(--ink)] px-3 py-2 text-xs font-semibold text-[var(--ink)] transition hover:bg-[#eef1f8] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)] disabled:opacity-55"><span className="block">ดาวน์โหลด Word</span><span className="mt-0.5 block text-[10px] font-normal">{cycleCount ? `${cycleCount} ครั้งในรอบนี้` : "รอบนี้ยังไม่มีข้อมูล"}</span></button></td></tr>; })}</Fragment>)}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
