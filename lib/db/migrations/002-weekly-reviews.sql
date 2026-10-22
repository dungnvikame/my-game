-- Phase 2: weekly_reviews — tự chấm 1-10 từng mảng + ghi chú, theo tuần ISO
-- Chạy trong Supabase SQL Editor. Backup: Database → Backups trước khi chạy.

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  iso_week text not null check (iso_week ~ '^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$'),
  area_scores jsonb not null default '{}'::jsonb,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, iso_week)
);

alter table public.weekly_reviews enable row level security;

drop policy if exists "weekly_reviews: chỉ chủ sở hữu" on public.weekly_reviews;
create policy "weekly_reviews: chỉ chủ sở hữu"
  on public.weekly_reviews for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
