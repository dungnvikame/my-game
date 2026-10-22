---
title: "Feature pack: Insight Engine (Phase 3) + Essentials"
status: done
created: 2026-10-22
---

# Feature pack: Insight Engine + Essentials

Thực hiện Phase 3 của MVP plan (insight rule-based) sớm hơn lịch theo yêu cầu chủ app,
kèm nhóm tính năng căn bản còn thiếu phát hiện khi dogfood.

## Scope

### A. Insight Engine (theo phase-03, giữ nguyên spec)
- Migration `003-suggestions.sql`: bảng suggestions (user_id, iso_week, area_key, rule_key,
  status accepted/dismissed, unique 4 cột đầu) + RLS. Chỉ ghi khi user bấm Nhận/Bỏ qua
  (khác spec gốc: không ghi `proposed` lúc render — GET không side-effect; acceptance rate
  tính từ accepted/(accepted+dismissed)).
- `lib/insight/rules.ts` thuần + tests: R1 hụt kéo dài (<50% × 2 tuần), R2 lệch cảm nhận–hành vi
  (|score/10 − fulfillment| ≥ 0.4), R3 quá tải (actual > 2×expected × 2 tuần). Top 3 theo severity,
  evidence dẫn số cụ thể.
- `components/insight/insight-panel.tsx` trên dashboard + server action accept/dismiss.
- Lưu ý dữ liệu: mới có ~1 tuần dữ liệu → R1/R3 im lặng cho tới khi đủ 2 tuần (đúng thiết kế).

### B. Essentials
- Check-in ngày cũ: `/checkin?date=YYYY-MM-DD` (validate, không tương lai, tối đa 30 ngày trước).
- Streak: số ngày check-in liên tiếp (tính cả hôm nay hoặc kết thúc hôm qua), hiện trên check-in.
- Tab Lịch sử: 14 ngày gần nhất (mood + tổng giờ, bấm vào sửa), card streak, nút đăng xuất.
- Logout: server action signOut → /login.

## Không làm (đợt này)
PWA offline, push notification, LLM insight, goals/gamification (chờ gate 2 tuần của MVP plan).

## Done =
Build + lint + tests pass; migration chạy trên Supabase; verify light/dark mobile; push main (auto-deploy).
