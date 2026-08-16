# Daily History and Work Statistics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มประวัติรายวันที่มีข้อมูล สถิตินับครั้งสะสมแยกตามงาน และตัวเลือกดาวน์โหลด Word รายวัน/รายเดือน โดยคงฟอร์มและรูปแบบ Word เดิม

**Architecture:** เพิ่ม pure helpers ใน `lib/work-log-insights.ts` สำหรับจัดกลุ่ม `WorkLog` ตามวันและนับตาม `workloadId` จากนั้นให้ `app/page.tsx` คำนวณข้อมูลและส่งให้ component ใหม่ `DailyHistory` และ `WorkloadStats` ส่วนการส่งออกใช้ `buildWordDocument` เดิม โดยเปลี่ยนเฉพาะชุด log ที่ป้อนเข้าไปตามโหมดดาวน์โหลด

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest

## Global Constraints

- ห้ามเปลี่ยนฟอร์มเพิ่ม/แก้ไข/ลบข้อมูล
- ห้ามเปลี่ยน markup, CSS, หัวข้อ, ตาราง, หรือรูปแบบเอกสารที่สร้างโดย `buildWordDocument`
- สถิตินับจำนวน log ต่อหนึ่ง `workloadId` จากทุกวันที่มีข้อมูลใน `logs`
- รายวันใช้ log ของ `selectedDate` เท่านั้น; รายเดือนใช้ log ที่มี prefix เดือนเดียวกับ `selectedDate`
- ปุ่มดาวน์โหลดต้อง disabled เมื่อช่วงเวลาที่เลือกไม่มีข้อมูล
- ต้องรักษาการเรียงข้อมูลและการเลือกวันที่เดิม

---

### Task 1: เพิ่ม pure data helpers สำหรับประวัติและสถิติ

**Files:**
- Create: `lib/work-log-insights.ts`
- Create: `tests/work-log-insights.test.ts`
- Reference: `lib/types.ts`, `lib/workload-data.ts`

**Interfaces:**
- Produces `summarizeLogsByDate(logs: WorkLog[]): DailyLogSummary[]`
- Produces `countWorkloadOccurrences(logs: WorkLog[], workloads: WorkloadDefinition[]): WorkloadOccurrence[]`
- Produces `filterLogsByScope(logs: WorkLog[], selectedDate: string, scope: "day" | "month"): WorkLog[]`

```ts
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
```

- [ ] **Step 1: Write failing tests** for grouping three logs across two dates, counting attachment totals, sorting dates newest-first, counting repeated workload IDs across dates, sorting counts descending, excluding unknown workload IDs, and filtering day/month scopes.
- [ ] **Step 2: Run the focused test**

Run: `npm test -- tests/work-log-insights.test.ts`

Expected: FAIL because `lib/work-log-insights.ts` does not exist.

- [ ] **Step 3: Implement the helpers** with `Map`, `startsWith`, and no React/Supabase/DOM dependencies. `filterLogsByScope` uses exact date equality for `"day"` and `selectedDate.slice(0, 7)` prefix matching for `"month"`; grouping and counting return an empty array for empty input.
- [ ] **Step 4: Run focused and existing tests**

Run: `npm test -- tests/work-log-insights.test.ts tests/storage.test.ts tests/auth.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/work-log-insights.ts tests/work-log-insights.test.ts
git commit -m "feat: add work log history and occurrence helpers"
```

### Task 2: เพิ่ม UI ประวัติรายวันและสถิตินับครั้งตามงาน

**Files:**
- Create: `components/DailyHistory.tsx`
- Create: `components/WorkloadStats.tsx`
- Modify: `app/page.tsx`
- Reference: `components/DailyLog.tsx`, `components/SummaryStrip.tsx`, `app/globals.css`

**Interfaces:**
- `DailyHistory` consumes `summaries: DailyLogSummary[]`, `selectedDate: string`, and `onSelectDate: (date: string) => void`.
- `WorkloadStats` consumes `stats: WorkloadOccurrence[]`.

- [ ] **Step 1: Keep both components presentational**: they receive already grouped props and contain no Supabase calls, export logic, or data grouping.
- [ ] **Step 2: Implement `DailyHistory`** as a responsive list/table showing Thai date, `logCount`, and `fileCount`; selected date gets existing blue visual treatment; clicking a row calls `onSelectDate`; empty state says there is no recorded date yet.
- [ ] **Step 3: Implement `WorkloadStats`** as a compact ranked list showing workload code/title and `count` with Thai “ครั้ง”; show a clear empty state when `stats` is empty.
- [ ] **Step 4: Wire `app/page.tsx`**:
  - import both helper functions and components;
  - derive `dailySummaries` and `workloadStats` with `useMemo` from `logs` and `WORKLOADS`;
  - keep `dailyLogs`, `monthlyLogs`, `selectedDate`, and all EntryForm handlers unchanged;
  - render history and stats before the selected-day detail section;
  - when a history row is selected, update only `selectedDate` and clear `editingLog`.
- [ ] **Step 5: Run type-check and tests**

Run: `npm run lint` and `npm test`

Expected: exit code 0, with 12 existing tests plus the new helper tests passing.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/DailyHistory.tsx components/WorkloadStats.tsx
git commit -m "feat: show daily history and workload statistics"
```

### Task 3: เพิ่มตัวเลือกดาวน์โหลด Word รายวัน/รายเดือนโดยคง template เดิม

**Files:**
- Modify: `app/page.tsx`
- Test: `tests/work-log-insights.test.ts` (reuse filtering cases; no Word markup changes)
- Do not modify: `lib/word-export.ts`

**Interfaces:**
- Internal `handleExportWord(scope: "day" | "month")` selects `dailyLogs` or `monthlyLogs` before calling the existing `ensureWordImageDimensions` and `buildWordDocument`.

- [ ] **Step 1: Use the focused helper tests** for the selection rule: day scope returns only `2026-08-15`; month scope returns all `2026-08-*` logs and excludes `2026-07-*`. Keep the test about filtering, not DOM or generated markup.
- [ ] **Step 2: Implement the minimal export change** in `app/page.tsx`:
  - change the handler signature to accept `scope`;
  - use `const exportLogs = scope === "day" ? dailyLogs : monthlyLogs`;
  - preserve the exact calls to `ensureWordImageDimensions` and `buildWordDocument`;
  - use filenames `บันทึกประจำวัน-${selectedDate}.doc` and `บันทึกประจำเดือน-${selectedDate.slice(0, 7)}.doc`;
  - render two buttons labeled `ส่งออก Word รายวัน` and `ส่งออก Word รายเดือน`, each disabled only when its own list is empty.
- [ ] **Step 3: Run focused tests**

Run: `npm test -- tests/work-log-insights.test.ts`

Expected: all filtering and grouping tests pass.

- [ ] **Step 4: Verify `lib/word-export.ts` has no diff**

Run: `git diff -- lib/word-export.ts`

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx tests/work-log-insights.test.ts
git commit -m "feat: add daily and monthly Word export options"
```

### Task 4: Full verification and handoff

**Files:**
- Verify: all changed files and generated build output

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 2: Run type-check**

Run: `npm run lint`

Expected: exit code 0.

- [ ] **Step 3: Run production build with configured test environment**

Run: `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test npm run build -- --webpack`

Expected: build exits 0; no changes to Word template are required.

- [ ] **Step 4: Inspect final diff**

Run: `git diff --check` and `git status --short`

Expected: no whitespace errors; only intended feature files are changed.
