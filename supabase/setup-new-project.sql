-- Initial setup for a new Supabase project. Run once in SQL Editor.
-- Includes migrations 0001 through 0005 in order.

begin;

-- Source: 0001_daily_workload.sql
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

-- Source: 0002_increase_evidence_upload_limit.sql
update storage.buckets
set file_size_limit = 104857600
where id = 'work-evidence';

-- Source: 0003_add_evaluation_cycle.sql
alter table public.work_logs
  add column if not exists evaluation_cycle smallint;

update public.work_logs
set evaluation_cycle = case
  when extract(month from work_date) >= 9 or extract(month from work_date) <= 2 then 1
  else 2
end
where evaluation_cycle is null;

alter table public.work_logs
  alter column evaluation_cycle set default 1,
  alter column evaluation_cycle set not null;

alter table public.work_logs
  drop constraint if exists work_logs_evaluation_cycle_check;

alter table public.work_logs
  add constraint work_logs_evaluation_cycle_check check (evaluation_cycle in (1, 2));

-- Source: 0004_workload_definitions.sql
create table if not exists public.workload_definitions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  category text not null,
  code text not null,
  title text not null,
  weight numeric not null default 0 check (weight >= 0 and weight <= 100),
  targets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.workload_definitions enable row level security;

drop policy if exists "users manage own workload definitions" on public.workload_definitions;
create policy "users manage own workload definitions" on public.workload_definitions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.seed_default_workload_definitions(target_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.workload_definitions (user_id, id, category, code, title, weight, targets)
  values
    (target_user_id, 'main-1-1', 'งานหลัก', '1.1', 'โครงการนิทรรศการศูนย์การเรียนรู้วัฒนธรรมเกาหลี', 10, '[]'::jsonb),
    (target_user_id, 'main-1-2', 'งานหลัก', '1.2', 'งานบริหารลูกค้าสัมพันธ์', 10, '[]'::jsonb),
    (target_user_id, 'main-1-3', 'งานหลัก', '1.3', 'งานผลิตสื่อเพื่อเผยแพร่บนแพลตฟอร์มออนไลน์', 10, '[]'::jsonb),
    (target_user_id, 'main-1-4', 'งานหลัก', '1.4', 'งานออกแบบสื่อกราฟฟิก', 10, '[]'::jsonb),
    (target_user_id, 'main-1-5', 'งานหลัก', '1.5', 'งานผลิตสื่อวิดีทัศน์', 10, '[]'::jsonb),
    (target_user_id, 'main-1-6', 'งานหลัก', '1.6', 'บริการ AI Lab for Research Up-Skill', 10, '[]'::jsonb),
    (target_user_id, 'main-1-7', 'งานหลัก', '1.7', 'บริการยืม - คืนทรัพยากรสารสนเทศ', 5, '[]'::jsonb),
    (target_user_id, 'main-1-8', 'งานหลัก', '1.8', 'บริการทรัพยากรสารสนเทศสื่อโสตทัศน์และสื่อดิจิทัลสร้างสรรค์', 5, '[]'::jsonb),
    (target_user_id, 'secondary-2-1', 'งานรอง', '2.1', 'โครงการ OPEN House', 5, '[]'::jsonb),
    (target_user_id, 'secondary-2-2', 'งานรอง', '2.2', 'วิทยากร AI', 5, '[]'::jsonb),
    (target_user_id, 'secondary-2-3', 'งานรอง', '2.3', 'การมาปฏิบัติราชการตรงตามเวลาราชการ', 5, '[]'::jsonb),
    (target_user_id, 'culture-3-1', 'งานทำนุบำรุงศิลปะและวัฒนธรรม', '3.1', 'งานทำนุบำรุงศิลปะและวัฒนธรรม', 5, '[]'::jsonb),
    (target_user_id, 'other-4-1', 'งานอื่น ๆ', '4.1', 'งานปฏิบัติตามคำสั่งบังคับบัญชา/คณะกรรมการ', 5, '[]'::jsonb),
    (target_user_id, 'other-4-2', 'งานอื่น ๆ', '4.2', 'งานพัฒนาตนเอง', 5, '[]'::jsonb)
  on conflict (user_id, id) do nothing;
$$;

insert into public.workload_definitions (user_id, id, category, code, title, weight, targets)
select users.id, defaults.id, defaults.category, defaults.code, defaults.title, defaults.weight, defaults.targets
from auth.users as users
cross join (values
  ('main-1-1', 'งานหลัก', '1.1', 'โครงการนิทรรศการศูนย์การเรียนรู้วัฒนธรรมเกาหลี', 10, '[]'::jsonb),
  ('main-1-2', 'งานหลัก', '1.2', 'งานบริหารลูกค้าสัมพันธ์', 10, '[]'::jsonb),
  ('main-1-3', 'งานหลัก', '1.3', 'งานผลิตสื่อเพื่อเผยแพร่บนแพลตฟอร์มออนไลน์', 10, '[]'::jsonb),
  ('main-1-4', 'งานหลัก', '1.4', 'งานออกแบบสื่อกราฟฟิก', 10, '[]'::jsonb),
  ('main-1-5', 'งานหลัก', '1.5', 'งานผลิตสื่อวิดีทัศน์', 10, '[]'::jsonb),
  ('main-1-6', 'งานหลัก', '1.6', 'บริการ AI Lab for Research Up-Skill', 10, '[]'::jsonb),
  ('main-1-7', 'งานหลัก', '1.7', 'บริการยืม - คืนทรัพยากรสารสนเทศ', 5, '[]'::jsonb),
  ('main-1-8', 'งานหลัก', '1.8', 'บริการทรัพยากรสารสนเทศสื่อโสตทัศน์และสื่อดิจิทัลสร้างสรรค์', 5, '[]'::jsonb),
  ('secondary-2-1', 'งานรอง', '2.1', 'โครงการ OPEN House', 5, '[]'::jsonb),
  ('secondary-2-2', 'งานรอง', '2.2', 'วิทยากร AI', 5, '[]'::jsonb),
  ('secondary-2-3', 'งานรอง', '2.3', 'การมาปฏิบัติราชการตรงตามเวลาราชการ', 5, '[]'::jsonb),
  ('culture-3-1', 'งานทำนุบำรุงศิลปะและวัฒนธรรม', '3.1', 'งานทำนุบำรุงศิลปะและวัฒนธรรม', 5, '[]'::jsonb),
  ('other-4-1', 'งานอื่น ๆ', '4.1', 'งานปฏิบัติตามคำสั่งบังคับบัญชา/คณะกรรมการ', 5, '[]'::jsonb),
  ('other-4-2', 'งานอื่น ๆ', '4.2', 'งานพัฒนาตนเอง', 5, '[]'::jsonb)
) as defaults(id, category, code, title, weight, targets) on conflict (user_id, id) do nothing;

create or replace function public.handle_new_user_workload_definitions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_workload_definitions(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seed_workloads on auth.users;
create trigger on_auth_user_created_seed_workloads
  after insert on auth.users
  for each row execute procedure public.handle_new_user_workload_definitions();

alter table public.work_logs
  drop constraint if exists work_logs_workload_definition_fk;

alter table public.work_logs
  add constraint work_logs_workload_definition_fk
  foreign key (user_id, workload_id)
  references public.workload_definitions(user_id, id)
  on delete cascade;

-- Source: 0005_unique_workload_codes.sql
create unique index if not exists workload_definitions_user_code_unique
  on public.workload_definitions (user_id, code);

commit;
