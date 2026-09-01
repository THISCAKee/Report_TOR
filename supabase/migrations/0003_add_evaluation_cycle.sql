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
