create unique index if not exists workload_definitions_user_code_unique
  on public.workload_definitions (user_id, code);
