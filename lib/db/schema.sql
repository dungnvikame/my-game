-- Life Balance App — Phase 1 schema
-- Chạy trong Supabase SQL Editor. Idempotent ở mức tạo mới (chạy 1 lần trên project mới).

-- 1) profiles: 1-1 với auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2) life_areas: 8 mảng cố định (seed, dùng chung mọi user)
create table if not exists public.life_areas (
  key text primary key,
  name_vi text not null,
  sort_order int not null
);

insert into public.life_areas (key, name_vi, sort_order) values
  ('health',    'Sức khỏe', 1),
  ('family',    'Gia đình', 2),
  ('relations', 'Mối quan hệ', 3),
  ('work',      'Công việc', 4),
  ('finance',   'Tài chính', 5),
  ('learning',  'Học tập', 6),
  ('leisure',   'Giải trí', 7),
  ('meaning',   'Ý nghĩa & Phát triển bản thân', 8)
on conflict (key) do nothing;

-- 3) area_weights: trọng số 1-5 từng mảng theo user
create table if not exists public.area_weights (
  user_id uuid not null references auth.users (id) on delete cascade,
  area_key text not null references public.life_areas (key),
  weight int not null check (weight between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, area_key)
);

-- 4) daily_checkins: 1 bản ghi / user / ngày
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  mood int not null check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- 5) checkin_hours: giờ / mảng của một check-in
create table if not exists public.checkin_hours (
  checkin_id uuid not null references public.daily_checkins (id) on delete cascade,
  area_key text not null references public.life_areas (key),
  hours numeric(4,1) not null check (hours >= 0 and hours <= 24),
  primary key (checkin_id, area_key)
);

-- RLS: bật trên mọi bảng user-data; life_areas đọc công khai (bảng tĩnh)
alter table public.profiles enable row level security;
alter table public.area_weights enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.checkin_hours enable row level security;
alter table public.life_areas enable row level security;

create policy "life_areas đọc được bởi mọi user đã đăng nhập"
  on public.life_areas for select to authenticated using (true);

create policy "profiles: chỉ chủ sở hữu"
  on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "area_weights: chỉ chủ sở hữu"
  on public.area_weights for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "daily_checkins: chỉ chủ sở hữu"
  on public.daily_checkins for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "checkin_hours: chỉ qua check-in của chính mình"
  on public.checkin_hours for all to authenticated
  using (exists (select 1 from public.daily_checkins c
                 where c.id = checkin_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.daily_checkins c
                      where c.id = checkin_id and c.user_id = (select auth.uid())));

-- Tự tạo profile khi user mới đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
