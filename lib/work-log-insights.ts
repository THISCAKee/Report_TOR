import type { WorkLog, WorkloadDefinition } from "@/lib/types";

export type DailyLogSummary = {
  date: string;
  logCount: number;
  fileCount: number;
};

export type WorkloadOccurrence = {
  workloadId: string;
  code: string;
  title: string;
  count: number;
};

export function summarizeLogsByDate(logs: WorkLog[]): DailyLogSummary[] {
  const summaries = new Map<string, DailyLogSummary>();
  for (const log of logs) {
    const current = summaries.get(log.date) ?? { date: log.date, logCount: 0, fileCount: 0 };
    current.logCount += 1;
    current.fileCount += log.attachments.length;
    summaries.set(log.date, current);
  }
  return [...summaries.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function countWorkloadOccurrences(logs: WorkLog[], workloads: WorkloadDefinition[]): WorkloadOccurrence[] {
  const definitions = new Map(workloads.map((workload) => [workload.id, workload]));
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (definitions.has(log.workloadId)) counts.set(log.workloadId, (counts.get(log.workloadId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([workloadId, count]) => {
      const workload = definitions.get(workloadId)!;
      return { workloadId, code: workload.code, title: workload.title, count };
    })
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
}

export function filterLogsByScope(logs: WorkLog[], selectedDate: string, scope: "day" | "month"): WorkLog[] {
  const month = selectedDate.slice(0, 7);
  return logs.filter((log) => scope === "day" ? log.date === selectedDate : log.date.startsWith(month));
}

export function summarizeMonthlyWorkloadOccurrences(logs: WorkLog[], selectedDate: string, workloads: WorkloadDefinition[]): WorkloadOccurrence[] {
  return summarizeWorkloadOccurrencesForMonth(logs, selectedDate.slice(0, 7), workloads);
}

export function summarizeWorkloadOccurrencesForMonth(logs: WorkLog[], month: string, workloads: WorkloadDefinition[]): WorkloadOccurrence[] {
  return countWorkloadOccurrences(logs.filter((log) => log.date.startsWith(month)), workloads);
}
