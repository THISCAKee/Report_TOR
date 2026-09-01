"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCalendarDays, formatCalendarMonth, getDateLogCounts } from "@/lib/calendar";
import { getTodayIso } from "@/lib/format";
import type { WorkLog } from "@/lib/types";

type Props = {
  month: string;
  selectedDate: string;
  logs: WorkLog[];
  onSelectDate: (date: string) => void;
  onChangeMonth: (month: string) => void;
};

const monthOptions = Array.from({ length: 12 }, (_, index) => `${index + 1}`.padStart(2, "0"));
const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const shiftMonth = (month: string, offset: number) => {
  const date = new Date(`${month}-01T00:00:00`);
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export function Calendar({ month, selectedDate, logs, onSelectDate, onChangeMonth }: Props) {
  const [year] = month.split("-");
  const days = useMemo(() => buildCalendarDays(month), [month]);
  const counts = useMemo(() => getDateLogCounts(logs), [logs]);
  const today = getTodayIso();
  const yearNumber = Number(year);
  const years = Array.from({ length: 11 }, (_, index) => yearNumber - 5 + index);
  const [holidays, setHolidays] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const controller = new AbortController();
    const visibleYears = [...new Set(days.map((day) => day.date.slice(0, 4)))];
    void Promise.all(visibleYears.map(async (visibleYear) => {
      const response = await fetch(`/api/holidays?year=${visibleYear}`, { signal: controller.signal });
      if (!response.ok) throw new Error("โหลดวันหยุดไม่สำเร็จ");
      return response.json() as Promise<Record<string, string[]>>;
    })).then((results) => setHolidays(Object.assign({}, ...results))).catch((reason: unknown) => {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) setHolidays({});
    });
    return () => controller.abort();
  }, [days]);

  return (
    <section aria-labelledby="calendar-title" className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[0_18px_50px_rgba(23,35,63,.06)] sm:p-7 lg:sticky lg:top-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--gold)]">ปฏิทินบันทึกงาน</p>
          <h2 id="calendar-title" className="mt-1 text-2xl font-semibold tracking-tight">เลือกวันที่ทำงาน</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">แสดงวันที่มีบันทึกและวันหยุดราชการไทย</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-[#f4f6ff] p-1">
          <button type="button" aria-label="เดือนก่อนหน้า" onClick={() => onChangeMonth(shiftMonth(month, -1))} className="focus-ring grid size-9 place-items-center rounded-lg text-lg text-[var(--blue)] transition hover:bg-white">‹</button>
          <button type="button" aria-label="กลับเดือนปัจจุบัน" onClick={() => onChangeMonth(today.slice(0, 7))} className="focus-ring rounded-lg px-2.5 py-2 text-xs font-semibold text-[var(--blue)] transition hover:bg-white">วันนี้</button>
          <button type="button" aria-label="เดือนถัดไป" onClick={() => onChangeMonth(shiftMonth(month, 1))} className="focus-ring grid size-9 place-items-center rounded-lg text-lg text-[var(--blue)] transition hover:bg-white">›</button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select aria-label="เลือกเดือน" value={month.slice(5, 7)} onChange={(event) => onChangeMonth(`${year}-${event.target.value}`)} className="focus-ring rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)]">
          {monthOptions.map((value, index) => <option key={value} value={value}>{monthNames[index]}</option>)}
        </select>
        <select aria-label="เลือกปี พ.ศ." value={year} onChange={(event) => onChangeMonth(`${event.target.value}-${month.slice(5, 7)}`)} className="focus-ring rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)]">
          {years.map((value) => <option key={value} value={value}>{value + 543}</option>)}
        </select>
        <span className="ml-auto text-sm font-semibold text-[var(--ink)]">{formatCalendarMonth(month)}</span>
      </div>

      <div className="mt-5 grid grid-cols-7 border-b border-[var(--line)] pb-2 text-center text-[11px] font-bold text-[var(--muted)]">
        {[
          ["อา", "text-[var(--red)]"], ["จ", ""], ["อ", ""], ["พ", ""], ["พฤ", ""], ["ศ", ""], ["ส", "text-[var(--red)]"],
        ].map(([label, color]) => <span key={label} className={color}>{label}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, index) => {
          const count = counts[day.date] ?? 0;
          const selected = selectedDate === day.date;
          const isToday = today === day.date;
          const weekend = index % 7 === 0 || index % 7 === 6;
          const holidayNames = holidays[day.date] ?? [];
          const holidayLabel = holidayNames.join(" · ");
          return <button key={day.date} type="button" aria-label={`${day.date}${holidayLabel ? ` ${holidayLabel}` : ""}${count ? ` มี ${count} รายการ` : ""}`} aria-pressed={selected} onClick={() => onSelectDate(day.date)} className={`focus-ring relative min-h-16 rounded-xl border p-2 text-left transition sm:min-h-[6.25rem] ${selected ? "border-[var(--blue)] bg-[#edf1ff] shadow-[0_5px_14px_rgba(47,86,211,.12)]" : !day.inCurrentMonth ? "border-transparent bg-[#fafafa] text-[#b8bdc8]" : holidayNames.length ? "border-[#f4d6d6] bg-[#fff8f8] hover:border-[#e7b5b5] hover:bg-[#fff3f3]" : "border-transparent bg-white hover:border-[#cdd6f4] hover:bg-[#f7f8ff]"}`}>
            <span className={`grid size-8 place-items-center rounded-full text-sm font-semibold ${selected ? "bg-[var(--blue)] text-white" : isToday ? "border border-[var(--blue)] text-[var(--blue)]" : weekend && day.inCurrentMonth ? "text-[var(--red)]" : "text-[var(--ink)]"}`}>{day.day}</span>
            {holidayNames.length ? <><span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--red)] sm:hidden" aria-hidden="true" /><span title={holidayLabel} className={`mt-1 hidden line-clamp-2 text-[10px] font-semibold leading-4 sm:block ${selected ? "text-[var(--blue)]" : "text-[var(--red)]"}`}>{holidayLabel}</span></> : null}
            {count ? <span className={`absolute bottom-2 left-2 right-2 truncate text-xs font-bold ${selected ? "text-[var(--blue)]" : "text-[var(--green)]"}`}>{count} รายการ</span> : null}
          </button>;
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)]"><span><i className="mr-1 inline-block size-2 rounded-full bg-[var(--green)]" />มีบันทึก</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[var(--red)]" />วันหยุดราชการ</span><span><i className="mr-1 inline-block size-2 rounded-full border border-[var(--blue)]" />วันนี้</span></div>
    </section>
  );
}
