# Supabase + Vercel Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ย้ายระบบบันทึกภาระงานจาก localStorage ไป Supabase พร้อม Login ผู้ใช้คนเดียว, Storage ไฟล์แนบ และโครงสร้างพร้อม deploy บน Vercel

**Architecture:** ใช้ Supabase Auth สำหรับ session ใน cookie, Supabase Postgres สำหรับ work logs และ Supabase Storage สำหรับไฟล์แนบ โดยแยก browser/server Supabase clients และใช้ RLS จำกัดด้วย `auth.uid()`. หน้า dashboard จะอ่าน/เขียนผ่าน server actions หรือ route handlers; localStorage จะเหลือเฉพาะขั้นตอน import ครั้งเดียว

**Tech Stack:** Next.js App Router, React, TypeScript, `@supabase/supabase-js`, `@supabase/ssr`, Supabase Postgres/Auth/Storage, Vercel Environment Variables, Vitest

## Global Constraints

- ผู้ใช้มีบัญชีเดียวและต้อง Login ก่อนใช้งาน dashboard
- ห้ามใช้ service-role key ใน client หรือ bundle
- `work_logs` และ `work_log_files` ต้องเปิด RLS และ policy ต้องอิง `auth.uid()`
- Bucket ชื่อ `work-evidence`; path ไฟล์ต้องเป็น `<user_id>/<work_log_id>/<safe-file-name>`
- ข้อมูล TOR คงที่ยังคงอยู่ใน `lib/workload-data.ts`
- รักษา UI ตาราง TOR, modal form, image preview, daily log table และ monthly Word export
- `npm test`, `npm run lint`, `npm run build` ต้องผ่านก่อนส่งมอบ

## File Map

- Modify: `package.json` — เพิ่ม Supabase packages
- Create: `supabase/migrations/001_work_logs.sql` — tables, indexes, RLS policies, storage policies
- Create: `lib/supabase/client.ts` — browser client
- Create: `lib/supabase/server.ts` — server client with cookie adapter
- Create: `lib/supabase/types.ts` — Database type contracts
- Create: `lib/supabase/work-logs.ts` — CRUD/query/file metadata functions
- Create: `lib/supabase/auth.ts` — login/logout/session helpers
- Create: `app/login/page.tsx`, `components/LoginForm.tsx` — single-user login UI
- Create: `middleware.ts` — refresh session and protect dashboard routes
- Modify: `app/page.tsx` — load Supabase logs, save/delete/import/export data
- Modify: `components/EntryForm.tsx` — upload files to Storage and submit database draft
- Modify: `components/DailyLog.tsx` — render signed/downloadable evidence URLs
- Create: `components/AccountBar.tsx` — current email and sign out
- Create: `components/ImportLocalData.tsx` — one-time localStorage migration UI
- Create: `app/actions/work-logs.ts` — authenticated server actions for mutations
- Create: `app/actions/auth.ts` — sign-in/sign-out actions
- Create: `docs/supabase-vercel-setup.md` — project setup, SQL, Auth, Storage and Vercel steps
- Modify: `tests/storage.test.ts` or create focused tests under `tests/supabase.test.ts` — pure transformation/error behavior

### Task 1: Add Supabase dependencies and environment contract

- [ ] Write a test that `getSupabaseEnv()` throws a clear Thai/English setup error when URL or publishable key is missing.
- [ ] Run `npm test -- --run tests/supabase.test.ts`; expect failure because the environment helper does not exist.
- [ ] Add `@supabase/supabase-js` and `@supabase/ssr` to `package.json`.
- [ ] Implement `lib/supabase/env.ts` with `getSupabaseEnv(): { url: string; publishableKey: string }`, reading `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and throwing `Supabase environment variables are missing` if either is empty.
- [ ] Add `.env.example` with variable names only and no secrets.
- [ ] Run the focused test, then `npm run lint`.

### Task 2: Create database schema and security policies

**Files:** `supabase/migrations/001_work_logs.sql`, `lib/supabase/types.ts`

- [ ] Add SQL for `work_logs` and `work_log_files` with the exact columns from the design spec, indexes on `(user_id, date)` and `(work_log_id)`, and `updated_at` trigger behavior.
- [ ] Enable RLS on both tables.
- [ ] Add authenticated-only SELECT/INSERT/UPDATE/DELETE policies using `user_id = auth.uid()` and `WITH CHECK` on writes.
- [ ] Add Storage bucket `work-evidence` and object policies requiring `(storage.foldername(name))[1] = (select auth.uid()::text)` for authenticated users.
- [ ] Add generated TypeScript `Database` types matching table rows, inserts, updates, and storage metadata.
- [ ] Add a setup note that SQL must be run in Supabase SQL Editor and the single user must be created in Authentication → Users.

### Task 3: Implement Supabase clients and session protection

**Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/auth.ts`, `middleware.ts`

- [ ] Implement `createBrowserSupabaseClient()` using `createBrowserClient` and the public env contract.
- [ ] Implement `createServerSupabaseClient()` using `createServerClient` and Next cookie get/set/remove adapters.
- [ ] Implement `getCurrentUser(): Promise<User | null>`, `signInWithPassword(email, password)`, and `signOut()`.
- [ ] Add middleware that refreshes the session and redirects unauthenticated requests from `/` to `/login`; allow `/login` and static assets.
- [ ] Add tests for route classification helpers if extracted; verify no service key is imported by client modules.

### Task 4: Build login page and account controls

**Files:** `app/login/page.tsx`, `components/LoginForm.tsx`, `app/actions/auth.ts`, `components/AccountBar.tsx`

- [ ] Create a login form with email/password, pending state, Supabase error message, and a Thai “เข้าสู่ระบบ” action; do not render signup/reset controls.
- [ ] Implement `signInAction(formData)` that validates non-empty email/password, calls Supabase Auth, and redirects to `/` on success.
- [ ] Render account email and “ออกจากระบบ” in the dashboard header.
- [ ] Implement `signOutAction()` and redirect to `/login` after clearing the cookie session.
- [ ] Test validation pure functions for empty credentials and mapped Supabase auth errors.

### Task 5: Implement database CRUD and Storage operations

**Files:** `lib/supabase/work-logs.ts`, `app/actions/work-logs.ts`, `lib/types.ts`

- [ ] Define `WorkLogRow`, `WorkLogWithFiles`, and `WorkLogDraft` mappings between Supabase snake_case and existing UI camelCase.
- [ ] Implement `listWorkLogs()` ordered by `date asc, created_at asc`, with file metadata joined or fetched by `work_log_id`.
- [ ] Implement `createWorkLog(draft)`, `updateWorkLog(id, draft)`, and `deleteWorkLog(id)`; every mutation obtains the server-side authenticated user before writing.
- [ ] Implement `uploadWorkEvidence(userId, logId, file)` with sanitized filename, Storage path, and metadata insert; remove the uploaded object if metadata insert fails.
- [ ] Implement `removeWorkEvidence(fileId)` after verifying ownership; delete the Storage object and metadata row.
- [ ] Add tests for snake_case/camelCase mapping, safe filename generation, and partial upload cleanup behavior.

### Task 6: Replace localStorage dashboard persistence

**Files:** `app/page.tsx`, `components/EntryForm.tsx`, `components/DailyLog.tsx`, `components/SummaryStrip.tsx`

- [ ] Replace initial `getStoredLogs()` load with an authenticated server action/query and show loading/error states.
- [ ] Change save callbacks to call `createWorkLog`/`updateWorkLog`, then refresh the local UI state from the returned row.
- [ ] Change delete to call `deleteWorkLog` and update the table only after server success.
- [ ] Change attachment handling to keep selected `File` objects until submit, upload them to Storage, and render signed/public URLs from Supabase metadata.
- [ ] Preserve image preview, multiple file selection, 10 MB per log client guard, quantity/unit, notes, and current modal behavior.
- [ ] Add an account bar and sign-out action without changing the Word export table layout.

### Task 7: Add one-time localStorage import

**Files:** `components/ImportLocalData.tsx`, `app/actions/work-logs.ts`, `app/page.tsx`

- [ ] Detect valid legacy `daily-workload-logs` data after login using a pure `readLegacyLogs()` parser; never clear it during detection.
- [ ] Show an import panel with count, attachment count, and “นำเข้าข้อมูลเดิม” button only when legacy data exists.
- [ ] Implement `importLegacyLogs()` to create rows for the current user, upload data URL attachments to Storage, and roll back the created rows/objects if any item fails.
- [ ] Remove the localStorage key only after the complete import succeeds; keep it on failure and show the failed item.
- [ ] Add tests for valid JSON, malformed JSON, empty arrays, and preserving legacy data on a failed import.

### Task 8: Make Word export use Supabase files

**Files:** `app/page.tsx`, `lib/word-export.ts`

- [ ] Fetch the selected month’s logs plus file data before export and convert image URLs/data to embedded data URLs in the browser.
- [ ] Preserve the six reference columns, wide evidence column, no image filename, and calculated width/height preserving aspect ratio.
- [ ] Keep export disabled while evidence is being prepared and show a Thai error if an image cannot be loaded.
- [ ] Test the pure Word HTML builder with file metadata and image dimensions.

### Task 9: Document Supabase and Vercel deployment

**Files:** `docs/supabase-vercel-setup.md`, `README.md`

- [ ] Document creating a Supabase project, running the migration SQL, creating one Auth user, creating/confirming `work-evidence`, and configuring Auth Site URL/Redirect URLs.
- [ ] Document adding `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Vercel Development/Preview/Production environments; explicitly warn never to expose service-role keys.
- [ ] Document GitHub import to Vercel, build command, and post-deploy smoke test.
- [ ] Include data limits: Supabase Free database 500 MB and Storage 1 GB; per-file upload UI limit 10 MB.

### Task 10: Verify end to end

- [ ] Run `npm test` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm TypeScript passes.
- [ ] Run `npm run build` with configured environment variables or the documented setup error behavior.
- [ ] Manually verify login, refresh persistence, add/edit/delete, multiple file upload, image preview, local import, monthly Word export, and logout.
- [ ] Verify no service key appears in browser bundle or committed files.

## Self-review

- Covers Login, session refresh, RLS, database, Storage, CRUD, file rollback, local migration, Word export, environment variables, Vercel deployment, and verification.
- No placeholder steps or undefined cross-task function names remain.
- No public unauthenticated data path is included.
