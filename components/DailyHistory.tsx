import { useState } from "react";
import { formatThaiDate } from "@/lib/format";
import { getVisibleItems } from "@/lib/list-display";
import type { DailyLogSummary } from "@/lib/work-log-insights";

type Props = {
  summaries: DailyLogSummary[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export function DailyHistory({ summaries, selectedDate, onSelectDate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleSummaries = getVisibleItems(summaries, expanded);

  return (
    <section aria-labelledby="daily-history-title" className="rounded-3xl border border-[var(--line)] bg-white/45 p-5 sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--gold)]">ประวัติการบันทึก</p>
          <h2 id="daily-history-title" className="mt-1 text-xl font-semibold tracking-tight">เลือกดูรายละเอียดแต่ละวัน</h2>
        </div>
        <span className="text-xs text-[var(--muted)]">ทั้งหมด {summaries.length} วัน</span>
      </div>
      {!summaries.length ? <div className="paper-grid rounded-2xl border border-dashed border-[#c5cad5] px-5 py-10 text-center text-sm text-[var(--muted)]">ยังไม่มีวันที่บันทึกข้อมูล</div> : <>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{visibleSummaries.map((summary) => {
        const selected = summary.date === selectedDate;
        return <button key={summary.date} type="button" aria-pressed={selected} onClick={() => onSelectDate(summary.date)} className={`focus-ring flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${selected ? "border-[var(--blue)] bg-[#edf1ff] shadow-[0_6px_16px_rgba(47,86,211,.1)]" : "border-[var(--line)] bg-white hover:border-[#aeb6c8] hover:bg-[#fbfcff]"}`}>
          <span><span className={`block text-sm font-semibold ${selected ? "text-[var(--blue)]" : "text-[var(--ink)]"}`}>{formatThaiDate(summary.date)}</span><span className="mt-1 block text-xs text-[var(--muted)]">{summary.logCount} รายการ · {summary.fileCount} ไฟล์แนบ</span></span>
          <span className={`grid size-8 place-items-center rounded-full text-sm ${selected ? "bg-[var(--blue)] text-white" : "bg-[#eef1f8] text-[var(--muted)]"}`}>→</span>
        </button>;
        })}</div>
        {summaries.length > 3 ? <button type="button" onClick={() => setExpanded((current) => !current)} className="focus-ring mt-4 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--blue)] transition hover:border-[var(--blue)] hover:bg-[#f7f8ff]">{expanded ? "แสดงน้อยลง" : "แสดงทั้งหมด"}</button> : null}
      </>}
    </section>
  );
}
