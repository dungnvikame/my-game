---
title: "Phase 2: Dashboard & Weekly Review"
status: in-progress
---

# Phase 2: Dashboard & Weekly Review (Sprint 2, 2 tuần)

## Context Links

- [plan.md](./plan.md) · [Phase 1](./phase-01-start.md)

## Overview

Priority P1. Biến dữ liệu check-in thành bức tranh: bánh xe cân bằng, trend theo tuần, và nghi thức weekly review 5 phút — đơn vị nhịp chính của sản phẩm.

## User Stories

1. **US-2.1** — Là người dùng, tôi muốn thấy bánh xe cân bằng của 7 ngày gần nhất (giờ thực tế đã chuẩn hóa theo trọng số) để biết mảng nào đang hụt.
   - AC: radar/wheel chart 8 trục; mỗi trục hiện % so với mức "đủ" suy từ trọng số; trạng thái rỗng thân thiện khi chưa đủ dữ liệu.
2. **US-2.2** — Là người dùng, tôi muốn xem trend từng mảng theo tuần (4-8 tuần gần nhất) để thấy mình đang tốt lên hay tệ đi.
   - AC: line/bar theo tuần cho mảng được chọn; kèm mood trung bình tuần.
3. **US-2.3** — Là người dùng, cuối tuần tôi muốn một màn review 5 phút: tự chấm 1-10 cho từng mảng + 1 ghi chú ngắn, đặt cạnh số giờ thực tế, để tôi tự thấy lệch giữa cảm nhận và hành vi.
   - AC: 1 màn duy nhất, 8 hàng chấm điểm tap-only + 1 ô ghi chú tùy chọn; lưu theo tuần ISO; xem lại được review các tuần trước; có thể làm bù trong 3 ngày đầu tuần sau.

## Architecture

- Bảng mới: `weekly_reviews` (user_id, iso_week, area_scores jsonb {area_key: 1-10}, note text, created_at; unique user_id+iso_week).
- Chuẩn hóa "đủ": expected_share(area) = weight/Σweights; actual_share = hours/Σhours tuần; fulfillment = actual/expected (cap 150%). Logic đặt trong `lib/balance/score.ts` thuần túy (unit-test được), không trộn vào component.
- Chart: Recharts (RadarChart + LineChart) — phổ biến, AI coding tool thạo.

## Related Code Files

- `app/dashboard/page.tsx`, `app/review/page.tsx`
- `lib/balance/score.ts` (+ `score.test.ts`), `lib/db/migrations/002-weekly-reviews.sql`
- `components/dashboard/{balance-wheel,area-trend}.tsx`, `components/review/score-row.tsx`

## Implementation Steps

1. Migration `weekly_reviews` (backup schema trước khi chạy).
2. Viết `score.ts` + unit tests cho fulfillment (các ca: tuần thiếu ngày, Σhours=0, cap).
3. Dashboard: wheel 7 ngày + trend theo tuần + mood.
4. Màn weekly review + nhắc trong-app (banner chủ nhật/thứ hai nếu chưa review).
5. Deploy, dùng thật 1 tuần, đối chiếu wheel với dữ liệu Supabase.

## Todo

- [x] Migration weekly_reviews (file sẵn sàng — chờ chạy trên Supabase SQL Editor)
- [x] lib/balance/score.ts + unit tests pass (17 tests, gồm review-week)
- [x] Balance wheel 7 ngày
- [x] Trend theo tuần + mood
- [x] Màn weekly review + làm bù 3 ngày
- [ ] Deploy + đối chiếu số liệu thủ công (cần nối Vercel + dùng thật 1 tuần)

## Success Criteria

Sau 1 tuần dùng thật: wheel và trend khớp dữ liệu nhập (đối chiếu tay); hoàn thành 1 weekly review < 5 phút.

## Risk Assessment

- "Mức đủ" suy từ trọng số có thể cho cảm giác sai → hiển thị cả số giờ thô cạnh %, không chỉ %; tinh chỉnh công thức ở Phase 3 khi có dữ liệu.
- Radar chart khó đọc trên mobile → fallback: bar chart ngang 8 hàng (quyết định bằng mắt thật trên điện thoại).

## Security Considerations

RLS cho `weekly_reviews`; ghi chú review là dữ liệu nhạy cảm — không log ra server console.

## Next Steps

Phase 3 cần ≥ 2 tuần dữ liệu check-in + ≥ 1 weekly review để rule có đầu vào thật.
