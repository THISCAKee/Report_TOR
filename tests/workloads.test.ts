import { describe, expect, it } from "vitest";
import { validateNewWorkloadDraft, validateWorkloadDraft } from "@/lib/workloads";

describe("workload editing", () => {
  it("accepts a title and weight within the allowed range", () => {
    expect(validateWorkloadDraft({ title: "งานใหม่", weight: 25 })).toBeNull();
  });

  it("rejects an empty title", () => {
    expect(validateWorkloadDraft({ title: "   ", weight: 25 })).toBe("กรุณากรอกหัวข้อ TOR");
  });

  it("rejects a weight outside zero to one hundred", () => {
    expect(validateWorkloadDraft({ title: "งานใหม่", weight: 101 })).toBe("น้ำหนักต้องอยู่ระหว่าง 0 ถึง 100");
  });

  it("requires a code when creating a TOR item", () => {
    expect(validateNewWorkloadDraft({ category: "งานหลัก", code: " ", title: "งานใหม่", weight: 10 })).toBe("กรุณากรอกรหัส TOR");
  });

  it("accepts all fields required for a new TOR item", () => {
    expect(validateNewWorkloadDraft({ category: "งานรอง", code: "2.4", title: "งานใหม่", weight: 5 })).toBeNull();
  });
});
