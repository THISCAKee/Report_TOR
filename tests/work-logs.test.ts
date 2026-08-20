import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { saveWorkLog } from "@/lib/supabase/work-logs";
import type { Attachment, WorkLog, WorkLogDraft } from "@/lib/types";

type StoredFile = { id: string; work_log_id: string; storage_path: string };

function createSupabaseFake(initialFiles: StoredFile[]) {
  const files = [...initialFiles];
  const storageObjects = new Set(initialFiles.map((file) => file.storage_path));

  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: "user-1" } } }),
    },
    from: (table: string) => {
      if (table === "work_logs") {
        return {
          update: () => ({
            eq: () => ({
              select: () => ({
                single: async () => ({ data: { id: "log-1" }, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === "work_log_files") {
        return {
          select: () => ({
            eq: (column: string, value: string) => ({
              in: async (_idColumn: string, ids: string[]) => ({
                data: files.filter((file) => file[column as keyof StoredFile] === value && ids.includes(file.id)),
                error: null,
              }),
            }),
          }),
          delete: () => ({
            in: async (_column: string, ids: string[]) => {
              for (let index = files.length - 1; index >= 0; index -= 1) {
                if (ids.includes(files[index].id)) files.splice(index, 1);
              }
              return { error: null };
            },
          }),
          insert: async () => ({ error: null }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        remove: async (paths: string[]) => {
          paths.forEach((path) => storageObjects.delete(path));
          return { error: null };
        },
      }),
    },
  };

  return { client: client as unknown as SupabaseClient, files, storageObjects };
}

const attachment = (id: string, name: string): Attachment => ({
  id,
  name,
  size: 100,
  type: "image/png",
  dataUrl: `https://example.test/${name}`,
});

describe("saveWorkLog", () => {
  it("deletes a removed existing attachment from storage and file records", async () => {
    const kept = attachment("file-kept", "kept.png");
    const removed = attachment("file-removed", "removed.png");
    const existing: WorkLog = {
      id: "log-1",
      date: "2026-08-20",
      workloadId: "main-1-1",
      detail: "รายละเอียดเดิม",
      notes: "",
      quantity: "1",
      unit: "รายการ",
      attachments: [kept, removed],
      createdAt: "2026-08-20T00:00:00.000Z",
      updatedAt: "2026-08-20T00:00:00.000Z",
    };
    const draft: WorkLogDraft = {
      date: existing.date,
      workloadId: existing.workloadId,
      detail: existing.detail,
      notes: existing.notes,
      quantity: existing.quantity ?? "1",
      unit: existing.unit ?? "รายการ",
      attachments: [kept],
      files: [],
    };
    const fake = createSupabaseFake([
      { id: kept.id, work_log_id: existing.id, storage_path: "user-1/log-1/kept.png" },
      { id: removed.id, work_log_id: existing.id, storage_path: "user-1/log-1/removed.png" },
    ]);

    await saveWorkLog(fake.client, draft, existing);

    expect(fake.files.map((file) => file.id)).toEqual(["file-kept"]);
    expect([...fake.storageObjects]).toEqual(["user-1/log-1/kept.png"]);
  });
});
