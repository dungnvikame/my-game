-- Phase 3: suggestions — lưu phản hồi Nhận/Bỏ qua cho gợi ý rule-based theo tuần
-- Chạy trong Supabase SQL Editor. Backup: Database → Backups trước khi chạy.

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  iso_week text not null check (iso_week ~ '^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$'),
  area_key text not null references public.life_areas (key),
  rule_key text not null check (rule_key in ('r1_shortfall', 'r2_mismatch', 'r3_overload')),
  status text not null check (status in ('accepted', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (user_id, iso_week, area_key, rule_key)
);

alter table public.suggestions enable row level security;

drop policy if exists "suggestions owner only" on public.suggestions;
create policy "suggestions owner only"
  on public.suggestions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.suggestions to authenticated;
