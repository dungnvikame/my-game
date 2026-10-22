# 2026-10-22 — Phase 2: Dashboard & Weekly Review

## Bối cảnh
Tiếp quản từ phiên cloud: dựng repo local từ bundle, push `dungnvikame/my-game`. Trước Phase 2 đã đổi auth magic link → email + mật khẩu (Supabase built-in SMTP rate limit 2 mail/giờ; cần tắt "Confirm email" trên dashboard).

## Đã làm
- Migration `002-weekly-reviews.sql`: bảng `weekly_reviews` (jsonb area_scores, unique user+iso_week, RLS theo pattern Phase 1, regex W01-W53, drop policy trước create để idempotent).
- `lib/balance/score.ts`: computeFulfillment (expected=weight/Σw, actual=hours/Σh, cap 150%), isoWeekKey/mondayOf/aggregateByWeek. `lib/balance/review-week.ts`: target tuần + cửa sổ làm bù T2-T4. `lib/balance/today.ts`: nguồn "hôm nay" duy nhất theo Asia/Ho_Chi_Minh.
- UI: AppNav 3 tab; BalanceWheel (Recharts radar 1 series, % + giờ thô, cap 150%); AreaTrend (2 line chart xếp dọc — giờ/tuần + mood, không dual-axis, gap khi tuần trống); màn review 8 hàng 1-10 tap-only + note, xem lại tuần cũ; ReviewBanner (CN/T2-T4, Suspense, null khi lỗi).
- Test: vitest, 17 tests (fulfillment edge cases, ISO week rollover 2026-W53, review window).

## Vấn đề gặp & cách giải
- **Code-reviewer tìm ra 2 bug High trước khi commit:**
  1. Form làm bù: sau khi lưu tuần trước, redirect làm target nhảy sang tuần hiện tại nhưng ScoreRow giữ state cũ → bấm lưu lần nữa là copy điểm tuần trước sang tuần này. Fix: `<form key={targetWeek}>` + redirect `?saved=<tuần>` hiển thị đúng tuần đã lưu.
  2. "Hôm nay" tính 3 kiểu (UTC, server-local, local getters) → lệch 7h trên Vercel UTC, check-in 00:00-06:59 rơi sang ngày/tuần trước. Fix: `today.ts` dùng Intl timeZone Asia/Ho_Chi_Minh cho mọi call site (gồm cả checkin Phase 1).
- Server action enforce cửa sổ review (trước đó chỉ UI); trend đủ 8 slot tuần tròn từ thứ Hai (trước đó 9 tuần lệch, tuần đầu cụt); wheel có empty state riêng khi 7 ngày trống.
- `export const instant = false` trong các page là API không tồn tại (phiên trước ghi nhầm trong journal cũ) — vô hại vì page tự dynamic qua cookies; chưa dọn.

## Trạng thái / việc treo
- Code xong, 17/17 tests, build + lint pass, đã test UI desktop + mobile 375px.
- **Chờ user:** chạy `002-weekly-reviews.sql` trên Supabase SQL Editor (có thể cần `grant ... on public.weekly_reviews to authenticated` nếu project mới); nối Vercel ↔ GitHub; revoke token cũ; xóa 2 tài khoản test.
- Phase 3 cần ≥2 tuần dữ liệu thật + ≥1 weekly review.
- Câu hỏi sản phẩm để sau: có nên chặn review tuần hiện tại trước Chủ nhật không (hiện cho phép cả tuần).
