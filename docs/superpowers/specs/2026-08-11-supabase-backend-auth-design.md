# ระบบหลังบ้าน Supabase + Vercel — Design Spec

## เป้าหมาย

ย้ายระบบบันทึกภาระงานจาก `localStorage` ไปยัง Supabase เพื่อให้ข้อมูลและไฟล์แนบคงอยู่บนระบบออนไลน์ พร้อม deploy Next.js บน Vercel โดยมีผู้ใช้เพียงบัญชีเดียวและต้อง Login ก่อนใช้งาน

## สถาปัตยกรรม

- Next.js App Router เป็น frontend และ server-side route boundary
- Supabase Auth ใช้ Email/Password สำหรับบัญชีผู้ใช้คนเดียว
- Supabase Postgres เก็บ `work_logs` และ `work_log_files`
- Supabase Storage bucket `work-evidence` เก็บไฟล์แนบ
- ใช้ `@supabase/ssr` สร้าง browser/server clients และเก็บ session ใน cookie
- ใช้ publishable/anon key ใน browser ได้ แต่ไม่ใช้ service-role key ใน client หรือ bundle
- ใช้ RLS บนตารางและ Storage objects โดยทุก policy จำกัดด้วย `auth.uid()`

## Data model

`work_logs`

- `id uuid primary key`
- `user_id uuid references auth.users not null`
- `date date not null`
- `workload_id text not null`
- `detail text not null`
- `notes text not null default ''`
- `quantity text not null default '1'`
- `unit text not null default 'รายการ'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

`work_log_files`

- `id uuid primary key`
- `work_log_id uuid references work_logs(id) on delete cascade not null`
- `user_id uuid references auth.users not null`
- `name text not null`
- `mime_type text not null default 'application/octet-stream'`
- `size bigint not null`
- `storage_path text not null unique`
- `created_at timestamptz not null default now()`

Workload definitions remain in `lib/workload-data.ts` because they are fixed TOR reference data. Attachment URLs are created only for the authenticated user when displaying/downloaded.

## Security

- Login page uses Supabase email/password sign-in; no public signup screen
- A single account is created manually in Supabase Dashboard
- `work_logs` RLS: authenticated user can select/insert/update/delete only rows where `user_id = auth.uid()`
- `work_log_files` RLS: authenticated user can access only rows with matching `user_id`
- Storage object policies use the first path segment as the user id and require it to equal `auth.uid()`
- Route handlers re-check the authenticated user; UI state is never treated as authorization
- Missing Supabase environment variables show a setup error instead of silently falling back to local storage in production

## User flow

1. Visitor opens the site and sees Login.
2. Successful login loads the workload dashboard and fetches the user’s logs from Supabase.
3. New work is saved to `work_logs`; selected files upload to `work-evidence/<user_id>/<log_id>/<safe-file-name>` and metadata is inserted into `work_log_files`.
4. Edit updates the log and reconciles file additions/removals.
5. Delete removes the log and cascades metadata; storage objects are removed before/with deletion handling.
6. Export Word fetches the current month’s logs and creates the same six-column report: date, work, quantity, unit, evidence, and problem/solution. Images are embedded with calculated width/height to preserve aspect ratio.
7. Existing `localStorage` entries are detected after login. A one-time import action copies text data and files to Supabase; local data is retained until the import succeeds.

## UI changes

- Add `LoginPage` with email, password, error state, loading state, and sign-out action
- Hide workload dashboard until session is ready
- Add a small account bar with current email and “ออกจากระบบ”
- Replace local storage loading/saving with Supabase data hooks/server actions
- Keep current workload table, modal form, daily table, image previews, and Word export behavior

## Deployment

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or project anon key if the project exposes that legacy name)
- `SUPABASE_SERVICE_ROLE_KEY` only if a server-only cleanup route requires it; never expose to client

Supabase Auth URL configuration must include the Vercel production URL and local development URL. Supabase Free provides a 500 MB database quota and 1 GB Storage quota; the free per-file upload limit can be set up to 50 MB.

## Error handling

- Unauthenticated requests redirect to `/login`
- Expired sessions are refreshed by middleware and retried once
- Upload failure does not create orphaned metadata; failed uploads are removed
- Database errors show an actionable Thai message and preserve unsaved form data
- If a file is too large or browser storage conversion fails, the user can retry without losing the text form

## Acceptance criteria

- User must login before dashboard access
- Refreshing or opening the Vercel URL preserves data from Supabase
- CRUD operations affect only the logged-in user’s rows
- Multiple attachments upload and display with image previews
- Word export includes the monthly six-column table and correctly proportioned images
- `npm test`, `npm run lint`, and `npm run build` pass
- Setup instructions clearly identify Supabase SQL, Auth account creation, Storage bucket, and Vercel environment variables
