import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkloadCreateDraft, WorkloadDefinition, WorkloadEditDraft } from "@/lib/types";

type WorkloadRow = {
  id: string;
  category: WorkloadDefinition["category"];
  code: string;
  title: string;
  weight: number;
  targets: string[] | null;
};

export async function fetchWorkloads(client: SupabaseClient): Promise<WorkloadDefinition[]> {
  const { data, error } = await client.from("workload_definitions").select("id, category, code, title, weight, targets").order("code", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as WorkloadRow[]).map((row) => ({ ...row, targets: row.targets ?? [] }));
}

export async function createWorkload(client: SupabaseClient, draft: WorkloadCreateDraft) {
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("กรุณาเข้าสู่ระบบก่อนเพิ่ม TOR");

  const { data, error } = await client.from("workload_definitions").insert({
    user_id: authData.user.id,
    id: crypto.randomUUID(),
    category: draft.category,
    code: draft.code.trim(),
    title: draft.title.trim(),
    weight: draft.weight,
    targets: [],
  }).select("id, category, code, title, weight, targets").single();
  if (error?.code === "23505") throw new Error("รหัส TOR นี้มีอยู่แล้ว");
  if (error || !data) throw error ?? new Error("เพิ่มรายการ TOR ไม่สำเร็จ");
  return { ...(data as WorkloadRow), targets: (data as WorkloadRow).targets ?? [] } satisfies WorkloadDefinition;
}

export async function updateWorkload(client: SupabaseClient, workloadId: string, draft: WorkloadEditDraft) {
  const { data, error } = await client.from("workload_definitions").update({ title: draft.title.trim(), weight: draft.weight, updated_at: new Date().toISOString() }).eq("id", workloadId).select("id, category, code, title, weight, targets").single();
  if (error || !data) throw error ?? new Error("แก้ไขข้อมูล TOR ไม่สำเร็จ");
  return { ...(data as WorkloadRow), targets: (data as WorkloadRow).targets ?? [] } satisfies WorkloadDefinition;
}

export async function deleteWorkload(client: SupabaseClient, workloadId: string) {
  const { data: logs, error: logsError } = await client.from("work_logs").select("id").eq("workload_id", workloadId);
  if (logsError) throw logsError;
  const logIds = (logs ?? []).map((log) => log.id as string);
  if (logIds.length) {
    const { data: files, error: filesError } = await client.from("work_log_files").select("storage_path").in("work_log_id", logIds);
    if (filesError) throw filesError;
    const paths = (files ?? []).map((file) => file.storage_path as string);
    if (paths.length) {
      const { error: storageError } = await client.storage.from("work-evidence").remove(paths);
      if (storageError) throw storageError;
    }
  }
  const { error } = await client.from("workload_definitions").delete().eq("id", workloadId);
  if (error) throw error;
}
