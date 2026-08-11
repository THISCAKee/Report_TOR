import { formatThaiDate } from "@/lib/format";

type Props = { date: string; logCount: number; fileCount: number };

export function SummaryStrip({ date, logCount, fileCount }: Props) {
  return (
    <section aria-label="สรุปข้อมูลวันที่เลือก" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-4 shadow-[0_8px_22px_rgba(23,35,63,.04)]">
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--muted)]">วันที่บันทึก</p>
        <p className="mt-1.5 text-lg font-semibold tracking-tight">{formatThaiDate(date)}</p>
      </div>
      <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-4 shadow-[0_8px_22px_rgba(23,35,63,.04)]">
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--muted)]">งานวันนี้</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight">{logCount}<span className="ml-1 text-sm font-normal text-[var(--muted)]">รายการ</span></p>
      </div>
      <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-4 shadow-[0_8px_22px_rgba(23,35,63,.04)]">
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--muted)]">ไฟล์แนบวันนี้</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight">{fileCount}<span className="ml-1 text-sm font-normal text-[var(--muted)]">ไฟล์</span></p>
      </div>
    </section>
  );
}
