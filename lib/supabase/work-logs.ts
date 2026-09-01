import type { SupabaseClient } from "@supabase/supabase-js";
import type { Attachment, EvaluationCycle, WorkLog, WorkLogDraft } from "@/lib/types";

type FileRow = { id: string; storage_path: string; name: string; size: number; mime_type: string; width: number | null; height: number | null };
type LogRow = { id: string; work_date: string; workload_id: string; evaluation_cycle: EvaluationCycle | null; detail: string; notes: string; quantity: string; unit: string; created_at: string; updated_at: string; work_log_files: FileRow[] | null };

async function mapLog(client: SupabaseClient, row: LogRow): Promise<WorkLog> {
  const attachments = await Promise.all((row.work_log_files ?? []).map(async file => {
    const { data } = await client.storage.from("work-evidence").createSignedUrl(file.storage_path, 3600);
    return { id: file.id, name: file.name, size: file.size, type: file.mime_type, dataUrl: data?.signedUrl ?? "", width: file.width ?? undefined, height: file.height ?? undefined } satisfies Attachment;
  }));
  return { id: row.id, date: row.work_date, workloadId: row.workload_id, evaluationCycle: row.evaluation_cycle ?? 1, detail: row.detail, notes: row.notes, quantity: row.quantity, unit: row.unit, attachments, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function fetchWorkLogs(client: SupabaseClient) {
  const { data, error } = await client.from("work_logs").select("*, work_log_files(*)").order("work_date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return Promise.all(((data ?? []) as LogRow[]).map(row => mapLog(client, row)));
}

export async function saveWorkLog(client: SupabaseClient, draft: WorkLogDraft, existing?: WorkLog) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล");
  const payload = { user_id: user.id, work_date: draft.date, workload_id: draft.workloadId, evaluation_cycle: draft.evaluationCycle, detail: draft.detail, notes: draft.notes, quantity: draft.quantity || "1", unit: draft.unit || "รายการ", updated_at: new Date().toISOString() };
  const result = existing ? await client.from("work_logs").update(payload).eq("id", existing.id).select().single() : await client.from("work_logs").insert(payload).select().single();
  if (result.error || !result.data) throw result.error ?? new Error("บันทึกข้อมูลไม่สำเร็จ");
  const logId = result.data.id as string;
  const retainedAttachmentIds = new Set(draft.attachments.map(file => file.id));
  const removedAttachmentIds = existing?.attachments.filter(file => !retainedAttachmentIds.has(file.id)).map(file => file.id) ?? [];
  if (removedAttachmentIds.length) {
    const removedFiles = await client.from("work_log_files").select("id, storage_path").eq("work_log_id", logId).in("id", removedAttachmentIds);
    if (removedFiles.error) throw removedFiles.error;
    const paths = (removedFiles.data ?? []).map(file => file.storage_path);
    if (paths.length) {
      const removal = await client.storage.from("work-evidence").remove(paths);
      if (removal.error) throw removal.error;
    }
    const deletion = await client.from("work_log_files").delete().in("id", removedAttachmentIds);
    if (deletion.error) throw deletion.error;
  }
  for (const file of draft.files ?? []) {
    const path = `${user.id}/${logId}/${crypto.randomUUID()}-${file.name}`;
    const upload = await client.storage.from("work-evidence").upload(path, file, { upsert: false });
    if (upload.error) throw upload.error;
    const metadata = draft.attachments.find(item => item.name === file.name && item.size === file.size);
    const insert = await client.from("work_log_files").insert({ user_id: user.id, work_log_id: logId, storage_path: path, name: file.name, size: file.size, mime_type: file.type || "application/octet-stream", width: metadata?.width ?? null, height: metadata?.height ?? null });
    if (insert.error) throw insert.error;
  }
  return logId;
}

export async function deleteWorkLog(client: SupabaseClient, log: WorkLog) {
  const { data: files } = await client.from("work_log_files").select("storage_path").eq("work_log_id", log.id);
  if (files?.length) await client.storage.from("work-evidence").remove(files.map(file => file.storage_path));
  const { error } = await client.from("work_logs").delete().eq("id", log.id);
  if (error) throw error;
}
