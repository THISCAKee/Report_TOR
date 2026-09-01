import type { WorkLog } from "@/lib/types";

export type CalendarDay = {
  date: string;
  day: number;
  inCurrentMonth: boolean;
};

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const toIsoDate = (date: Date) => {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
};

export function buildCalendarDays(month: string): CalendarDay[] {
  const [yearString, monthString] = month.split("-");
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const firstDate = new Date(Date.UTC(year, monthIndex, 1));
  const firstGridDate = new Date(Date.UTC(year, monthIndex, 1 - firstDate.getUTCDay()));

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setUTCDate(firstGridDate.getUTCDate() + index);
    return {
      date: toIsoDate(date),
      day: date.getUTCDate(),
      inCurrentMonth: date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex,
    };
  });
}

export function formatCalendarMonth(month: string): string {
  const [yearString, monthString] = month.split("-");
  const monthIndex = Number(monthString) - 1;
  return `${THAI_MONTHS[monthIndex]} พ.ศ. ${Number(yearString) + 543}`;
}

export function getDateLogCounts(logs: WorkLog[]): Record<string, number> {
  return logs.reduce<Record<string, number>>((counts, log) => {
    counts[log.date] = (counts[log.date] ?? 0) + 1;
    return counts;
  }, {});
}
