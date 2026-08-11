# ระบบตารางภาระงานรายวัน Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** สร้างเว็บแอป Next.js + Tailwind CSS 4 + Anuphan สำหรับบันทึกภาระงานรายวันจากรายการ TOR โดยเก็บข้อมูลและไฟล์แนบใน `localStorage`

**Architecture:** ใช้ Next.js App Router หน้าเดียวแบบ client component แยกข้อมูล TOR, type, storage wrapper และ UI เป็นไฟล์ย่อย ฟอร์มส่ง WorkLog ให้ page จัดการเพิ่ม/แก้ไข/ลบ แล้วกรองตามวันที่ที่เลือก

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS 4, Google Font Anuphan, browser `localStorage` และ FileReader

## Global Constraints

- ใช้ภาษาไทยในข้อความ UI และใช้คำว่า “บันทึกภาระงาน” เป็น action หลัก
- รายการ TOR ต้องมีครบ 4 หมวด: งานหลัก 1.1–1.8, งานรอง 2.1–2.3, งานทำนุบำรุงศิลปะและวัฒนธรรม 3.1, งานอื่น ๆ 4.1–4.2
- ไฟล์แนบยอมรับทุกนามสกุลและรวมต่อรายการไม่เกิน 10 MB
- ข้อมูลต้องอยู่ต่อหลัง refresh ด้วย `localStorage`; ไม่ใช้ backend/auth
- ต้อง responsive, keyboard accessible และมี visible focus state
- ต้องรัน `npm run lint` และ `npm run build` ผ่านก่อนส่งมอบ

## File Map

- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `lib/types.ts`, `lib/workload-data.ts`, `lib/storage.ts`, `lib/format.ts`
- Create: `components/EntryForm.tsx`, `components/DailyLog.tsx`, `components/SummaryStrip.tsx`, `components/WorkloadSelect.tsx`
- Create: `tests/storage.test.ts`, `vitest.config.ts` (ถ้าตั้งค่า Vitest ได้โดยไม่เพิ่มความซับซ้อน)

### Task 1: Scaffold Next.js and visual foundation

**Files:** package/config files and `app/layout.tsx`, `app/globals.css`

- [ ] สร้าง package scripts `dev`, `build`, `start`, `lint` และ dependency ของ Next.js/React/Tailwind 4/TypeScript
- [ ] ตั้งค่า `next.config.ts`, `tsconfig.json`, PostCSS Tailwind 4 และ path alias `@/*`
- [ ] สร้าง layout metadata ภาษาไทย และโหลด Anuphan ด้วย `next/font/google` พร้อม fallback
- [ ] ใส่ design tokens ใน `globals.css`: `#F5F3EE`, `#17233F`, `#2F56D3`, `#D7A83E`, `#2E8B72`, radius, shadow และ focus ring
- [ ] กำหนด utility สำหรับ card, label, input, button และ reduced motion ให้คอมโพเนนต์ใช้ร่วมกัน
- [ ] รัน `npm run lint` เพื่อยืนยัน scaffold

### Task 2: Define TOR data and storage contracts

**Files:** `lib/types.ts`, `lib/workload-data.ts`, `lib/storage.ts`, `lib/format.ts`

- [ ] สร้าง type `WorkloadDefinition`, `Attachment`, `WorkLog` และ `WorkLogDraft`
- [ ] ใส่รายการ TOR 14 รายการพร้อม `id`, `category`, `code`, `title`, `weight` และเป้าหมายระดับ 1–5 แบบย่อ
- [ ] สร้าง `getStoredLogs()`, `saveStoredLogs(logs)`, `upsertLog(log)`, `removeLog(logId)` โดย guard `window` และจับ JSON/quota errors
- [ ] สร้าง `formatFileSize(bytes)`, `formatThaiDate(dateString)` และ `getTodayIso()` โดยหลีกเลี่ยง hydration mismatch
- [ ] เพิ่ม unit test สำหรับ parse ข้อมูลว่าง/เสีย, upsert, remove และ format file size; รัน test ให้ผ่าน

### Task 3: Build reusable workload select and summary

**Files:** `components/WorkloadSelect.tsx`, `components/SummaryStrip.tsx`

- [ ] สร้าง select แบบ `optgroup` ตาม category และส่ง `onChange(workloadId)` กลับให้ฟอร์ม
- [ ] เมื่อเลือกงาน แสดง code, น้ำหนัก และเกณฑ์ระดับเป้าหมายแบบ collapsible/compact helper
- [ ] สร้าง summary cards สำหรับวันที่เลือก, จำนวนรายการวันนี้ และจำนวนไฟล์แนบ
- [ ] ทำให้ทุก control มี label ที่สัมพันธ์ด้วย `htmlFor`, aria text ที่จำเป็น และ focus-visible state

### Task 4: Implement entry form with multi-file attachments

**Files:** `components/EntryForm.tsx`

- [ ] รองรับ mode สร้างใหม่/แก้ไขผ่าน `initialLog?: WorkLog` และ callback `onSave(draft)`, `onCancel()`
- [ ] สร้าง state สำหรับ date, workloadId, detail, attachments และ error
- [ ] ใช้ native date input, textarea และ file input `multiple` โดยไม่กำหนด `accept` เพื่อรองรับทุกนามสกุล
- [ ] แปลงไฟล์เป็น data URL ด้วย FileReader; ปฏิเสธเมื่อยอดรวมไฟล์ใหม่/เดิมเกิน 10 MB และรักษารายการเดิมเมื่อมีไฟล์อ่านไม่สำเร็จ
- [ ] แสดงชื่อไฟล์/ขนาด/ปุ่มลบ พร้อมข้อความสถานะ, disable ขณะอ่านไฟล์ และ reset ฟอร์มหลัง save สำเร็จ
- [ ] ทำ validation ของวันที่ รายการ และรายละเอียด non-whitespace พร้อมข้อความภาษาไทยใกล้ field

### Task 5: Implement daily log cards and page orchestration

**Files:** `components/DailyLog.tsx`, `app/page.tsx`

- [ ] สร้าง DailyLog card แสดงหมวด, code, ชื่องาน, น้ำหนัก, รายละเอียด และ link download ของไฟล์แนบ
- [ ] เพิ่มปุ่มแก้ไขและลบ; ลบต้องใช้ `window.confirm` พร้อมข้อความระบุชื่องาน
- [ ] ใน `page.tsx` ใช้ `useEffect` โหลด localStorage หลัง mount, ถือ `selectedDate`, `logs`, `editingLogId`, `notice`
- [ ] กรอง logs ด้วย `selectedDate`, คำนวณ summary, map workloadId ไปเป็นข้อมูล TOR
- [ ] ผูก save ให้สร้าง id/timestamps หรืออัปเดต log เดิม แล้วเรียก `saveStoredLogs`
- [ ] ทำ empty state และ notice สำเร็จ/ผิดพลาดที่อ่านได้ด้วย screen reader

### Task 6: Compose polished responsive UI

**Files:** `app/page.tsx`, `app/globals.css`, component files as needed

- [ ] วาง header, summary, form panel และ log panel ตาม layout สองคอลัมน์บน desktop/หนึ่งคอลัมน์บน mobile
- [ ] ใช้ hierarchy แบบเอกสารงานราชการร่วมสมัย: eyebrow, title, section label, divider, gold accent เฉพาะจุด
- [ ] เพิ่ม date navigation ที่ชัดเจนและคงตำแหน่ง form เมื่ออ่านรายการบนจอใหญ่โดยไม่ทำให้ mobile ติดขัด
- [ ] ตรวจ empty, validation, edit mode, long Thai text, long filename และไม่มีไฟล์แนบ
- [ ] ตรวจ prefers-reduced-motion และ contrast ของข้อความ/ปุ่ม

### Task 7: Verify and hand off

**Files:** all implementation files

- [ ] รัน `npm run lint`
- [ ] รัน `npm run build`
- [ ] เปิด dev server และตรวจด้วย browser ที่ความกว้าง desktop/mobile: เพิ่ม, refresh, edit, delete, file download
- [ ] ตรวจว่าไม่มี error ใน console และไม่มี hydration warning
- [ ] สรุปผลไฟล์ที่สร้างและคำสั่งใช้งานใน final response

## Self-review

- ครอบคลุม date picker, TOR selection, details, multi-file upload, localStorage, edit/delete, responsive layout และ Anuphan
- ไม่มี placeholder หรือชื่อฟังก์ชันที่ใช้งานข้าม task โดยไม่กำหนด
- ขอบเขตยังเป็นระบบเดียว ไม่มี backend/auth/report export ที่เกินคำขอ
