import { beforeEach, describe, expect, it } from "vitest";
import { getStoredLogs, removeLog, saveStoredLogs, upsertLog } from "@/lib/storage";
import { formatNote, isImageAttachment } from "@/lib/format";
import { buildWordDocument, calculateWordImageSize, escapeWordHtml } from "@/lib/word-export";
import type { WorkLog } from "@/lib/types";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});
Object.defineProperty(globalThis, "window", {
  value: { localStorage: globalThis.localStorage },
});

const sample: WorkLog = {
  id: "log-1",
  date: "2026-08-10",
  workloadId: "main-1-1",
  detail: "จัดเตรียมข้อเสนอโครงการ",
  notes: "ติดตามการอนุมัติโครงการ",
  attachments: [],
  createdAt: "2026-08-10T09:00:00.000Z",
  updatedAt: "2026-08-10T09:00:00.000Z",
};

describe("work log storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns an empty list when storage has no logs", () => {
    expect(getStoredLogs()).toEqual([]);
  });

  it("upserts a log and reads it back from localStorage", () => {
    saveStoredLogs(upsertLog([], sample));
    expect(getStoredLogs()).toEqual([sample]);
  });

  it("shows a dash when a table note is empty", () => {
    expect(formatNote("   ")).toBe("—");
  });

  it("recognizes image attachments for preview", () => {
    expect(isImageAttachment("image/png")).toBe(true);
    expect(isImageAttachment("application/pdf")).toBe(false);
  });

  it("escapes text before placing it in a Word export", () => {
    expect(escapeWordHtml("งาน <สำคัญ> & ด่วน")).toBe("งาน &lt;สำคัญ&gt; &amp; ด่วน");
  });

  it("builds an editable Word table with the reference columns", () => {
    const html = buildWordDocument("2026-08-10", [sample], [{ id: "main-1-1", category: "งานหลัก", code: "1.1", title: "โครงการนิทรรศการ", weight: 10, targets: [] }]);
    expect(html).toContain("ว/ด/ป");
    expect(html).toContain("งานที่ปฏิบัติ");
    expect(html).toContain("ปัญหา/ แนวทางแก้ไข");
    expect(html).toContain("max-width:5.6cm");
    expect(html).toContain("max-height:5.6cm");
    expect(html).toContain("width:5.6cm");
    expect(html).toContain("th:nth-child(5){width:50%}");
    expect(html).toContain("margin:0 auto 3px");
  });

  it("does not print image filenames below image evidence", () => {
    const imageLog = { ...sample, attachments: [{ id: "image-1", name: "หลักฐาน.png", size: 12, type: "image/png", dataUrl: "data:image/png;base64,abc", width: 1200, height: 800 }] };
    const html = buildWordDocument("2026-08-10", [imageLog], [{ id: "main-1-1", category: "งานหลัก", code: "1.1", title: "โครงการนิทรรศการ", weight: 10, targets: [] }]);
    expect(html).toContain("data:image/png;base64,abc");
    expect(html).toContain('width="212"');
    expect(html).toContain('height="141"');
    expect(html).not.toContain("หลักฐาน.png</span>");
  });

  it("scales Word images to 70 percent without changing aspect ratio", () => {
    expect(calculateWordImageSize(1200, 800)).toEqual({ width: 212, height: 141 });
    expect(calculateWordImageSize(800, 1200)).toEqual({ width: 141, height: 212 });
  });

  it("replaces an existing log with the same id", () => {
    const updated = { ...sample, detail: "ดำเนินกิจกรรมโครงการ" };
    expect(upsertLog([sample], updated)).toEqual([updated]);
  });

  it("removes only the requested log", () => {
    const second = { ...sample, id: "log-2" };
    expect(removeLog([sample, second], sample.id)).toEqual([second]);
  });
});
