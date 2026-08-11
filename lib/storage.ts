import type { WorkLog } from "@/lib/types";

const STORAGE_KEY = "daily-workload-logs";

export function getStoredLogs(): WorkLog[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkLog[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredLogs(logs: WorkLog[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function upsertLog(logs: WorkLog[], nextLog: WorkLog): WorkLog[] {
  const index = logs.findIndex((log) => log.id === nextLog.id);
  if (index === -1) return [...logs, nextLog];
  return logs.map((log) => (log.id === nextLog.id ? nextLog : log));
}

export function removeLog(logs: WorkLog[], id: string): WorkLog[] {
  return logs.filter((log) => log.id !== id);
}
