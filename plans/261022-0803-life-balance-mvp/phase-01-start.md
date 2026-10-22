---
title: "Phase 1: Nền tảng — Auth, Life Areas, Daily Check-in"
status: todo
---

# Phase 1: Nền tảng — Auth, Life Areas, Daily Check-in (Sprint 1, 2 tuần)

## Context Links

- Contract: `/home/user/plans/reports/brainstorm-261022-0756-life-balance-app.md`
- Plan index: [plan.md](./plan.md)

## Overview

Priority P1. Dựng xương sống sản phẩm: project Next.js + Supabase, đăng nhập, onboarding chọn trọng số 8 life areas, và màn daily check-in — thứ quyết định sống chết của toàn bộ core loop.

## User Stories

1. **US-1.1** — Là chủ app, tôi muốn đăng nhập bằng email (magic link) để dữ liệu của tôi đồng bộ giữa điện thoại và laptop.
   - AC: đăng nhập được trên cả mobile browser và desktop; session giữ ≥ 30 ngày.
2. **US-1.2** — Là người mới, tôi muốn đặt trọng số (1-5) cho 8 mảng cuộc sống trong lần đầu mở app, để hệ thống biết giai đoạn này tôi ưu tiên gì.
   - AC: onboarding 1 màn duy nhất; có preset mặc định; sửa lại được trong Settings.
3. **US-1.3** — Là người dùng hằng ngày, tôi muốn ghi lại giờ đã dành cho từng mảng + mood hôm nay chỉ bằng thao tác chạm, để việc check-in dưới 30 giây.
   - AC: slider bước 0.5h cho 8 mảng (mặc định 0, chỉ kéo mảng có hoạt động); mood 1-5 (5 emoji-level tap); 1 lần bấm Lưu; sửa được check-in của hôm nay; đo thời gian thao tác thực tế < 30s.

## Architecture

- Next.js App Router, server actions cho ghi dữ liệu; Supabase JS client + RLS (row-level security theo user_id).
- Schema Postgres (Supabase):
  - `profiles` (id = auth.uid, display_name, onboarded_at)
  - `life_areas` (8 bản ghi seed cố định: key, name_vi, sort_order)
  - `area_weights` (user_id, area_key, weight 1-5, updated_at)
  - `daily_checkins` (user_id, date, mood 1-5, created_at; unique user_id+date)
  - `checkin_hours` (checkin_id, area_key, hours numeric(4,1))
- PWA manifest + add-to-homescreen để mở nhanh trên điện thoại (không push notification).

## Related Code Files

Tạo mới (repo mới, đường dẫn tương đối repo):
- `app/(auth)/login/page.tsx`, `app/onboarding/page.tsx`, `app/checkin/page.tsx`
- `app/layout.tsx`, `middleware.ts` (bảo vệ route)
- `lib/supabase/{client,server}.ts`, `lib/db/schema.sql` (migration seed 8 areas)
- `components/checkin/{hour-slider,mood-picker}.tsx`

## Implementation Steps

1. Tạo repo + scaffold Next.js, Tailwind, cấu hình Supabase project (auth magic link, RLS).
2. Viết `schema.sql`: 5 bảng trên + RLS policies + seed 8 life areas. Chạy migration trên Supabase. Backup/export schema trước mọi thay đổi schema về sau.
3. Luồng auth: login bằng magic link, middleware redirect chưa-login → /login, chưa-onboard → /onboarding.
4. Màn onboarding: 8 hàng trọng số, preset mặc định, lưu `area_weights`.
5. Màn check-in: slider 8 mảng + mood, server action upsert theo (user_id, date), hiển thị trạng thái "đã check-in hôm nay".
6. Deploy Vercel, test trên điện thoại thật; tự bấm giờ 5 lần check-in.

## Todo

- [ ] Supabase project + schema + RLS + seed 8 areas
- [ ] Auth magic link + middleware
- [ ] Onboarding trọng số
- [ ] Màn daily check-in (slider + mood + upsert)
- [ ] Deploy Vercel + PWA manifest
- [ ] Đo check-in < 30s trên mobile thật (5 lần liên tiếp)

## Success Criteria

Tự check-in được 3 ngày liên tiếp trên điện thoại thật, mỗi lần < 30 giây, dữ liệu thấy đúng trong Supabase.

## Risk Assessment

- Slider 8 mảng vẫn quá chậm → fallback: chỉ hiện 4 mảng user hay dùng + nút "thêm mảng" (quyết định sau khi đo thực tế, không làm trước).
- Magic link bất tiện trên mobile → fallback: thêm Google OAuth (Supabase có sẵn, 1 giờ công).

## Security Considerations

RLS bắt buộc trên mọi bảng user-data; không bao giờ query bằng service key từ client; secrets để trong env Vercel.

## Next Steps

Phase 2 phụ thuộc dữ liệu check-in thật của ít nhất 1 tuần — bắt đầu dùng app ngay khi Phase 1 deploy, song song với việc code Phase 2.
