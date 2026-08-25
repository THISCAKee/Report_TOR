import { useState } from "react";
import { getVisibleItems } from "@/lib/list-display";
import type { WorkloadOccurrence } from "@/lib/work-log-insights";

type Props = { stats: WorkloadOccurrence[] };

export function WorkloadStats({ stats }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleStats = getVisibleItems(stats, expanded);

  return (
    <section aria-labelledby="workload-stats-title" className="rounded-3xl border border-[var(--line)] bg-white/45 p-5 sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--gold)]">ภาพรวมสะสม</p>
          <h2 id="workload-stats-title" className="mt-1 text-xl font-semibold tracking-tight">จำนวนครั้งที่ทำแต่ละงาน</h2>
        </div>
        <span className="text-xs text-[var(--muted)]">นับทุกวันที่มีข้อมูล</span>
      </div>
      {!stats.length ? <div className="paper-grid rounded-2xl border border-dashed border-[#c5cad5] px-5 py-10 text-center text-sm text-[var(--muted)]">ยังไม่มีสถิติการทำงาน</div> : <>
        <div className="space-y-2">{visibleStats.map((stat, index) => <div key={stat.workloadId} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef1f8] text-xs font-bold text-[var(--muted)]">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold"><span className="mr-2 rounded-full bg-[#edf1ff] px-2 py-1 text-xs font-bold text-[var(--blue)]">{stat.code}</span>{stat.title}</p></div><p className="shrink-0 text-right"><span className="text-xl font-semibold tracking-tight text-[var(--blue)]">{stat.count}</span><span className="ml-1 text-xs text-[var(--muted)]">ครั้ง</span></p></div>)}</div>
        {stats.length > 3 ? <button type="button" onClick={() => setExpanded((current) => !current)} className="focus-ring mt-4 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--blue)] transition hover:border-[var(--blue)] hover:bg-[#f7f8ff]">{expanded ? "แสดงน้อยลง" : "แสดงทั้งหมด"}</button> : null}
      </>}
    </section>
  );
}
