# 2026-10-22 — Pivot: check-in bằng hoạt động thực tế

## Vì sao
Chủ app dogfood và chê đúng: slider giờ là ước lượng trừu tượng — không có bằng chứng
đã dành thời gian, không kể lại được ngày sống thế nào, không thấy mất cân bằng ở đâu.

## Đổi mô hình
- `activities` (migration 004): date + area + minutes + note. Giờ/mảng từ đây SUY RA
  từ bằng chứng; `checkin_hours` giữ trong DB nhưng ngừng dùng; `daily_checkins` chỉ còn mood.
- Trang Hôm nay: mood lưu ngay khi tap (useOptimistic + server action), form ghi hoạt động
  (chip mảng + chip thời lượng 15p-4h + note), timeline ngày + "Chưa đụng tới: ...", xóa entry.
- Dashboard: card "Đang mất cân bằng (7 ngày)" (hụt sâu nhất ×2 + mảng nuốt thời gian ×1,
  dẫn số); nguồn dữ liệu wheel/trend/review/history/insight đều từ activities.
- DayEntry.mood thành optional; avgMood chia theo moodDays. Streak = ngày có mood HOẶC hoạt động.

## Bẫy đã gặp
- Trang check-in lúc đầu chỉ đếm streak từ activities → lệch với History (đếm cả mood-only).
  Đã thống nhất: union 2 nguồn.
- Dữ liệu slider test cũ (checkin_hours) tự động biến mất khỏi dashboard — đúng ý vì là dữ liệu giả.

## Verify
30/30 tests, build + lint pass. Mobile: ghi "chạy bộ 5km 45p" → timeline hiện,
note tự xóa sau submit (React 19 form reset), history "0.8h · 1 hoạt động · Tốt",
dashboard card mất cân bằng "Sức khỏe chiếm 100% tổng giờ, kỳ vọng 13%".

## Mở
- Nhập giờ tự do (ngoài 8 chip) chưa có — chờ nhu cầu thật.
- checkin_hours drop hẳn? Để Phase sau, không vội.
