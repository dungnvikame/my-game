# Brainstorm — Life Balance App (solution approaches trước PRD)

Ngày: 2026-10-22 · Người quyết định: dungnv@ikameglobal.com · Trạng thái: recommended, chờ chốt

## Brainstorm contract

**Outcome:** Web app cá nhân mà sau 4 tuần dogfooding, mỗi tuần cho chủ nhân (1) một bức tranh cân bằng cuộc sống phản ánh dữ liệu thật, và (2) ít nhất 1 gợi ý điều chỉnh cụ thể, đáng làm.

**Constraints:**
- Một người làm, PM vibe-code (không code truyền thống) — stack phải là đường mòn của AI coding tool.
- Web responsive (check-in chủ yếu trên điện thoại), chi phí vận hành gần 0 ở giai đoạn validate.
- Sprint 2 tuần; MVP trong 3 sprint (6 tuần) theo roadmap đã draft.
- Dữ liệu đời tư nhạy cảm: lưu trữ minh bạch, export/xóa được.

**Non-goals:**
- Native app / push notification hệ thống (PWA + reminder là đủ).
- Multi-user, social, team features.
- Integrations (calendar, chi tiêu, screen time) ở MVP — Phase 3.
- Gamification đầy đủ (level, quest) ở MVP.

**Acceptance criteria:**
1. Daily check-in hoàn thành dưới 30 giây trên mobile browser.
2. Sau 1 tuần dùng, dashboard bánh xe thể hiện đúng dữ liệu đã nhập (tự đối chiếu được).
3. Mỗi tuần hệ thống sinh ≥1 gợi ý rule-based mà chủ nhân đánh giá là "đúng và đáng làm".
4. Chủ nhân tự dùng liên tục 2 tuần không bỏ buổi weekly review (gate Phase 1).

## Approaches so sánh

### A — Guided journal + wheel (manual-first, rule-based insight)
Check-in tự nhập 30s/ngày + weekly review 5 phút; dashboard bánh xe; chẩn đoán bằng rule minh bạch (điểm thấp kéo dài, lệch trọng số vs thời gian).
- **Assumption tải trọng lớn nhất:** chủ nhân duy trì được nhập liệu thủ công hằng ngày.
- **Fail đầu tiên khi:** friction nhập liệu giết thói quen ở tuần 2–3 (đúng bệnh chung của category).
- **Worst case:** sản phẩm "nhạt" nhưng chạy được; biết ngay sau 2 tuần dogfooding với chi phí 2–3 sprint — rẻ nhất để bỏ nếu sai.

### B — Data-first passive tracking (integration trước)
Nối calendar/chi tiêu/screen time trước, tự dựng bức tranh cân bằng, nhập liệu tối thiểu.
- **Assumption tải trọng lớn nhất:** dữ liệu passive đủ phủ các mảng cuộc sống và solo dev xử lý nổi OAuth/API.
- **Fail đầu tiên khi:** sa lầy plumbing tích hợp nhiều tuần trước khi có sản phẩm; passive data mù hoàn toàn với gia đình, sức khỏe tinh thần, ý nghĩa — đúng những mảng cần cân bằng nhất.
- **Worst case:** 4–6 tuần chỉ có hạ tầng, chưa validate được core loop nào.

### C — AI-coach conversational (chat-first)
LLM phỏng vấn hằng tuần, tự duy trì "mô hình cuộc sống", dashboard render từ hội thoại.
- **Assumption tải trọng lớn nhất:** LLM extract dữ liệu có cấu trúc ổn định từ hội thoại tự do, với chi phí chấp nhận được.
- **Fail đầu tiên khi:** dữ liệu trích xuất không nhất quán → bánh xe nhiễu, trend vô nghĩa; khó debug chất lượng một mình.
- **Worst case:** demo rất "wow" nhưng không tin được số liệu của chính nó — sản phẩm mất lý do tồn tại.

## Recommendation

**Chọn A cho MVP**, đúng như draft kế hoạch hiện tại, vì nó là approach nhỏ nhất thỏa toàn bộ acceptance criteria và rẻ nhất để bỏ nếu assumption sai. Giảm rủi ro assumption của A bằng thiết kế: check-in dạng tap-only (không gõ chữ), chu kỳ phản hồi theo tuần, streak mềm.

Lấy phần tốt của C làm **gia vị, không làm nền móng**: từ Phase 2, weekly review thêm 1 đoạn AI tóm tắt tuần (LLM chỉ đọc dữ liệu có cấu trúc sẵn, không chịu trách nhiệm tạo dữ liệu). B giữ nguyên ở Phase 3, chỉ làm khi core loop đã sống.

**Better approaches:** none — hướng được yêu cầu (A, như draft) trùng với hướng được khuyến nghị sau khi so sánh; bằng chứng: failure mode của cả category là friction nhập liệu và thiếu lớp hành động, A xử lý trực diện cả hai với chi phí thấp nhất.

## Handoff

Tiếp theo: `/ak:plan` (hoặc viết PRD Sprint 1) dùng contract + recommendation ở trên. Rủi ro chưa giải quyết: xem câu hỏi mở.

## Câu hỏi mở

1. Bộ life areas mặc định chốt bao nhiêu mảng (6 hay 8) và có cho tùy biến ngay ở MVP không?
2. Check-in đo "phân bổ thời gian" ở độ thô nào (chọn 3 hoạt động nổi bật vs ước lượng giờ/mảng)? — quyết định trực tiếp friction.
3. Dữ liệu lưu local-first hay cloud ngay từ đầu (ảnh hưởng privacy và effort Supabase)?
