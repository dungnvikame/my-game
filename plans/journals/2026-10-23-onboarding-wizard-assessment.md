# 2026-10-23 — Onboarding khai thác + nhận định ban đầu

## Vì sao
Chủ app: onboarding cũ chỉ hỏi trọng số, không "hiểu" người dùng, không có nhận định
trước khi đẩy vào check-in.

## Đã làm
- Wizard 3 bước (client state, 1 submit cuối): ưu tiên 1-5 → hài lòng 1-10 (baseline,
  migration 006 profiles.baseline jsonb) → chọn ngày tiêu chuẩn từ 22 template
  (lib/onboarding/templates.ts — server tra theo id, không tin label từ client).
- lib/onboarding/assessment.ts (6 tests): avgScore CÓ TRỌNG SỐ; hotspots (w≥4, s≤5),
  strengths (w≥4, s≥7), blindspots (w≤2, s≤4); 3 mức summary.
- /onboarding/summary: nhận định + đề xuất 2 tuần + CTA check-in; xem lại được;
  chưa có baseline → redirect về wizard (user cũ onboard lại khi muốn).
- completeOnboarding: upsert weights/baseline/onboarded_at + insert routines (skip trùng label).

## Bẫy
- Phiên Supabase trong browser pane hết hạn qua đêm → cần user đăng nhập lại
  (SSO Google→GitHub→Supabase); browser pane cũng bị đóng giữa các phiên làm việc —
  tabs_context trả browserOpen false, phải navigate mở lại.
- Supabase SQL editor layout desktop khác mobile — click tọa độ dễ trượt, nên click
  rồi verify bằng monaco getValue trước khi Run.

## Verify
36/36 tests, build + lint pass. E2E tài khoản mới test-account-3@example.com:
đăng ký → wizard (SK w5/s3, GĐ w4/s4, CV w4/s8, GT w2) → nhận định 4.8/10 đúng công thức,
điểm nóng SK+GĐ, strengths CV → check-in hiện "Ngày tiêu chuẩn 0/3" đúng 3 template đã chọn.

## Treo
- 3 tài khoản test trên Supabase (test-account{,-2,-3}@example.com) — user tự xóa khi muốn.
- Nhận định hiện rule-based; cân nhắc LLM tổng hợp sâu hơn sau gate MVP.
