-- "Ngày tiêu chuẩn": hoạt động lặp lại hằng ngày, check-in chỉ cần tích ✓.
-- Tích = tạo activity gắn routine_id; bỏ tích = xóa activity đó.
-- Chạy trong Supabase SQL Editor. Backup: Database → Backups trước khi chạy.

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area_key text not null references public.life_areas (key),
  label text not null,
  minutes int not null check (minutes > 0 and minutes <= 1440),
  created_at timestamptz not null default now()
);

alter table public.routines enable row level security;

drop policy if exists "routines owner only" on public.routines;
create policy "routines owner only"
  on public.routines for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.routines to authenticated;

-- Xóa routine thì activity cũ giữ nguyên (vẫn là bằng chứng), chỉ mất liên kết
alter table public.activities
  add column if not exists routine_id uuid references public.routines (id) on delete set null;

create index if not exists activities_routine on public.activities (user_id, date, routine_id);
