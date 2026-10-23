-- Onboarding khai thác: lưu mức hài lòng ban đầu 1-10 từng mảng vào profiles
-- (baseline để nhận định ban đầu và so sánh tiến bộ về sau).
-- Chạy trong Supabase SQL Editor. Backup: Database → Backups trước khi chạy.

alter table public.profiles
  add column if not exists baseline jsonb;
