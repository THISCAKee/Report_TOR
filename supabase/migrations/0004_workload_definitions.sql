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
