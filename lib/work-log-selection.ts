export function toggleSelectedLogId(selectedIds: Set<string>, logId: string) {
  const next = new Set(selectedIds);
  if (next.has(logId)) next.delete(logId);
  else next.add(logId);
  return next;
}

export function selectAllLogIds(logIds: string[], selected: boolean) {
  return new Set(selected ? logIds : []);
}
