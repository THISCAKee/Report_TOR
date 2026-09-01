import type { EvaluationCycle, WorkLog } from "@/lib/types";

export type WorkCycle = {
  number: 1 | 2;
  startDate: string;
  endDate: string;
  label: "รอบที่ 1" | "รอบที่ 2";
};

const formatDate = (year: number, month: number, day: number) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

export function getWorkCycle(date: string): WorkCycle {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));

  if (month >= 9) {
    const endYear = year + 1;
    return {
      number: 1,
      startDate: formatDate(year, 9, 1),
      endDate: formatDate(endYear, 2, isLeapYear(endYear) ? 29 : 28),
      label: "รอบที่ 1",
    };
  }

  if (month <= 2) {
    return {
      number: 1,
      startDate: formatDate(year - 1, 9, 1),
      endDate: formatDate(year, 2, isLeapYear(year) ? 29 : 28),
      label: "รอบที่ 1",
    };
  }

  return {
    number: 2,
    startDate: formatDate(year, 3, 1),
    endDate: formatDate(year, 8, 31),
    label: "รอบที่ 2",
  };
}

export function getWorkCycleForNumber(month: string, number: EvaluationCycle): WorkCycle {
  const year = Number(month.slice(0, 4));
  if (number === 1) {
    const startYear = Number(month.slice(5, 7)) <= 2 ? year - 1 : year;
    const endYear = startYear + 1;
    return {
      number,
      startDate: formatDate(startYear, 9, 1),
      endDate: formatDate(endYear, 2, isLeapYear(endYear) ? 29 : 28),
      label: "รอบที่ 1",
    };
  }

  return {
    number,
    startDate: formatDate(year, 3, 1),
    endDate: formatDate(year, 8, 31),
    label: "รอบที่ 2",
  };
}

export function filterLogsByWorkCycle(logs: WorkLog[], selectedDate: string): WorkLog[] {
  const cycle = getWorkCycle(selectedDate);
  return logs.filter((log) => log.date >= cycle.startDate && log.date <= cycle.endDate);
}

export function filterLogsByEvaluationCycle(logs: WorkLog[], cycle: EvaluationCycle): WorkLog[] {
  return logs.filter((log) => log.evaluationCycle === cycle);
}

export function filterLogsByWorkCycleAndWorkload(logs: WorkLog[], selectedDate: string, workloadId: string): WorkLog[] {
  return filterLogsByWorkCycle(logs, selectedDate).filter((log) => log.workloadId === workloadId);
}
