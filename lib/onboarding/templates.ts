import type { AreaKey } from "@/lib/areas";

// Thư viện hoạt động tiêu chuẩn gợi ý khi onboarding — id ổn định để
// server action tra ngược, không tin dữ liệu label từ client.
export interface RoutineTemplate {
  id: string;
  areaKey: AreaKey;
  label: string;
  minutes: number;
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  { id: "health-exercise", areaKey: "health", label: "Tập thể dục / chạy bộ", minutes: 30 },
  { id: "health-walk", areaKey: "health", label: "Đi bộ, vận động nhẹ", minutes: 30 },
  { id: "health-meal", areaKey: "health", label: "Nấu / ăn bữa lành mạnh", minutes: 45 },
  { id: "family-dinner", areaKey: "family", label: "Ăn tối cùng gia đình", minutes: 60 },
  { id: "family-play", areaKey: "family", label: "Chơi / trò chuyện với người thân", minutes: 30 },
  { id: "family-call", areaKey: "family", label: "Gọi điện cho bố mẹ", minutes: 15 },
  { id: "relations-meet", areaKey: "relations", label: "Cà phê / gặp bạn bè", minutes: 60 },
  { id: "relations-text", areaKey: "relations", label: "Nhắn tin hỏi thăm một người", minutes: 15 },
  { id: "work-deepwork", areaKey: "work", label: "Khối deep work buổi sáng", minutes: 120 },
  { id: "work-plan", areaKey: "work", label: "Lên kế hoạch ngày mai", minutes: 15 },
  { id: "work-review", areaKey: "work", label: "Review công việc cuối ngày", minutes: 15 },
  { id: "finance-track", areaKey: "finance", label: "Ghi chép chi tiêu", minutes: 15 },
  { id: "finance-budget", areaKey: "finance", label: "Xem ngân sách / đầu tư", minutes: 30 },
  { id: "learning-read", areaKey: "learning", label: "Đọc sách", minutes: 30 },
  { id: "learning-course", areaKey: "learning", label: "Học khóa học / kỹ năng mới", minutes: 45 },
  { id: "learning-podcast", areaKey: "learning", label: "Nghe podcast", minutes: 30 },
  { id: "leisure-noscreen", areaKey: "leisure", label: "Nghỉ ngơi không màn hình", minutes: 30 },
  { id: "leisure-hobby", areaKey: "leisure", label: "Sở thích cá nhân", minutes: 60 },
  { id: "leisure-fun", areaKey: "leisure", label: "Xem phim / giải trí", minutes: 60 },
  { id: "meaning-journal", areaKey: "meaning", label: "Viết nhật ký / suy ngẫm", minutes: 15 },
  { id: "meaning-meditate", areaKey: "meaning", label: "Thiền / phút tĩnh lặng", minutes: 15 },
  { id: "meaning-goal", areaKey: "meaning", label: "Làm việc cho mục tiêu dài hạn", minutes: 45 },
];

export const TEMPLATE_BY_ID = new Map(ROUTINE_TEMPLATES.map((t) => [t.id, t]));
