-- Đổi mô hình check-in: ghi hoạt động thực tế (bằng chứng) thay cho kéo giờ ước lượng.
-- Giờ/mảng từ đây suy ra từ activities; checkin_hours cũ giữ nguyên (không drop) nhưng ngừng dùng.
-- Chạy trong Supabase SQL Editor. Backup: Database → Backups trước khi chạy.

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  area_key text not null references public.life_areas (key),
  minutes int not null check (minutes > 0 and minutes <= 1440),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists activities_user_date on public.activities (user_id, date);

alter table public.activities enable row level security;

drop policy if exists "activities owner only" on public.activities;
create policy "activities owner only"
  on public.activities for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.activities to authenticated;
