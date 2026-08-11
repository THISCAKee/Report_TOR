create extension if not exists pgcrypto;

create table if not exists public.work_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_date date not null,
  workload_id text not null,
  detail text not null default '',
  notes text not null default '',
  quantity text not null default '1',
  unit text not null default 'รายการ',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_log_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_log_id uuid not null references public.work_logs(id) on delete cascade,
  storage_path text not null,
  name text not null,
  size integer not null default 0,
  mime_type text not null default 'application/octet-stream',
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

alter table public.work_logs enable row level security;
alter table public.work_log_files enable row level security;

create policy "users manage own work logs" on public.work_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own work files" on public.work_log_files for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('work-evidence', 'work-evidence', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

create policy "users read own evidence" on storage.objects for select to authenticated
using (bucket_id = 'work-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users upload own evidence" on storage.objects for insert to authenticated
with check (bucket_id = 'work-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own evidence" on storage.objects for delete to authenticated
using (bucket_id = 'work-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
