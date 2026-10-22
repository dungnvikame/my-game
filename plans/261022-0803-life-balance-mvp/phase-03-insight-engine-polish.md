---
title: "Phase 3: Insight Engine & Polish"
status: todo
---

# Phase 3: Insight Engine & Polish (Sprint 3, 2 tuần)

## Context Links

- [plan.md](./plan.md) · [Phase 2](./phase-02-dashboard-weekly-review.md)

## Overview

Priority P1. Lớp khác biệt hóa của sản phẩm: chẩn đoán rule-based minh bạch và gợi ý điều chỉnh đầu tuần. Mọi gợi ý phải giải thích được "vì sao" từ dữ liệu.

## User Stories

1. **US-3.1** — Là người dùng, sáng thứ hai tôi muốn thấy 2-3 gợi ý điều chỉnh cho tuần mới, mỗi gợi ý nêu rõ căn cứ dữ liệu, để tôi quyết định có làm hay không.
   - AC: tối đa 3 gợi ý, xếp theo mức lệch; mỗi gợi ý có dòng "căn cứ" (vd: "Sức khỏe 2 tuần liền dưới 50% mức đủ"); tôi có thể đánh dấu từng gợi ý là Nhận / Bỏ qua.
2. **US-3.2** — Là người dùng, tôi muốn thấy cảnh báo khi cảm nhận và hành vi lệch nhau (tự chấm cao nhưng giờ thấp, hoặc ngược lại), vì đó là chỗ tôi tự lừa mình.
   - AC: rule so sánh score weekly review vs fulfillment; lệch > ngưỡng 2 bậc thì nêu trong insight tuần.
3. **US-3.3** — Là người dùng, tôi muốn app đủ mượt và sạch để dùng mỗi ngày không bực mình.
   - AC: polish pass — loading states, empty states, lỗi mạng có retry, dark mode theo hệ thống.

## Architecture

- Rules thuần túy trong `lib/insight/rules.ts`, chạy lúc render (không cần cron ở MVP — tính khi mở app đầu tuần):
  - R1 "Hụt kéo dài": fulfillment(area) < 50% trong ≥ 2 tuần liên tiếp.
  - R2 "Lệch cảm nhận–hành vi": |score/10 − fulfillment| lệch ≥ 2 bậc (bậc = 20%).
  - R3 "Quá tải một mảng": actual_share(area) > 2 × expected_share trong 2 tuần (gợi ý tiết chế).
  - Mỗi rule trả {area, severity, evidence_text, suggestion_text}; lấy top 3 theo severity.
- Bảng `suggestions` (user_id, iso_week, area_key, rule_key, status: proposed/accepted/dismissed) — để đo acceptance rate (north-star phụ).

## Related Code Files

- `lib/insight/rules.ts` (+ `rules.test.ts`), `lib/db/migrations/003-suggestions.sql`
- `app/dashboard/insight-panel.tsx`, `components/insight/suggestion-card.tsx`
- Polish: rà toàn bộ `app/**` (loading/empty/error), `app/globals.css` (dark mode)

## Implementation Steps

1. Migration `suggestions` (backup schema trước).
2. Viết 3 rules + unit tests với fixture dữ liệu 3 tuần giả lập (đủ ca: hụt, lệch, quá tải, không có gì).
3. Insight panel trên dashboard: hiện gợi ý tuần hiện tại + nút Nhận/Bỏ qua.
4. Polish pass toàn app + dark mode.
5. Bắt đầu đồng hồ gate: 2 tuần dùng liên tục, ghi lại đánh giá từng gợi ý (đúng/sai/vô dụng).

## Todo

- [ ] Migration suggestions
- [ ] 3 rules + unit tests pass (fixture 3 tuần)
- [ ] Insight panel + Nhận/Bỏ qua
- [ ] Polish: loading/empty/error states, dark mode
- [ ] Chạy gate 2 tuần + log đánh giá gợi ý hằng tuần

## Success Criteria

Trong 2 tuần gate: mỗi tuần ≥ 1 gợi ý được chủ nhân đánh giá "đúng, đáng làm"; không bỏ weekly review tuần nào. Qua gate → mở Phase 2 (Engagement) theo roadmap; trượt gate → sửa core loop, không đắp tính năng.

## Risk Assessment

- Rules cho gợi ý chung chung → evidence_text bắt buộc dẫn số cụ thể; nếu 2 tuần liền gợi ý vô dụng, chỉnh ngưỡng rule trước khi nghĩ đến LLM.
- 3 tuần dữ liệu chưa đủ cho R1/R3 ngay khi Phase 3 xong → chấp nhận: gate 2 tuần chạy sau deploy, dùng dữ liệu tích lũy từ Phase 1.

## Security Considerations

RLS cho `suggestions`; evidence_text sinh từ dữ liệu user, không nhúng vào analytics bên thứ ba.

## Next Steps

Sau gate: quyết định Phase 2 roadmap (Goals & actions, gamification mềm) dựa trên log đánh giá gợi ý; cân nhắc LLM summary cho weekly review khi dữ liệu có cấu trúc đã ổn định.
