# 2026-10-22 — Insight Engine (Phase 3) + Essentials

## Đã làm
- Migration `003-suggestions.sql` chạy trực tiếp trên Supabase qua browser pane (bảng suggestions, RLS, grant). Lưu ý Monaco SQL editor tự thêm `)` khi gõ — xóa bằng ctrl+End+Backspace trước khi Run.
- `lib/insight/rules.ts`: R1 hụt <50% × 2 tuần, R2 lệch cảm nhận–hành vi ≥0.4, R3 quá tải >2× kỳ vọng × 2 tuần; top 3 theo severity; evidence dẫn số. 8 unit tests.
- Khác spec gốc: KHÔNG ghi status `proposed` lúc render (GET sạch side-effect); chỉ upsert khi bấm Nhận/Bỏ qua. Tuần kết thúc gần nhất không có dữ liệu → panel ẩn hẳn (tránh khuyên từ số liệu cũ).
- Insight panel trên dashboard: card gợi ý + căn cứ, Nhận (badge giữ lại) / Bỏ qua (ẩn).
- Essentials: check-in ngày cũ `/checkin?date=` (cửa sổ 30 ngày, enforce cả server, form remount theo key=date); streak (`lib/balance/streak.ts`, giữ chuỗi nếu hôm nay chưa check-in); tab Lịch sử (streak + 14 ngày, bấm làm bù) ; logout (server action signOut, đặt cuối trang Lịch sử).

## Verify
30/30 tests, build + lint pass; browser mobile: làm bù ngày 10-21 → streak 1→2, danh sách cập nhật; dashboard phản ánh giờ mới, panel ẩn đúng.

## Trạng thái
Phase 3 còn mỗi gate 2 tuần dùng thật (log đánh giá gợi ý). Insight sẽ bắt đầu hiện từ tuần sau (W44) khi tuần W43 thành "tuần đã kết thúc có dữ liệu".
