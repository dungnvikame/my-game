export type AreaKey =
  | "health"
  | "family"
  | "relations"
  | "work"
  | "finance"
  | "learning"
  | "leisure"
  | "meaning";

export interface LifeArea {
  key: AreaKey;
  name: string;
  hint: string;
}

// 8 mảng cố định — phải khớp seed trong lib/db/schema.sql
export const LIFE_AREAS: LifeArea[] = [
  { key: "health", name: "Sức khỏe", hint: "ngủ, tập luyện, ăn uống" },
  { key: "family", name: "Gia đình", hint: "thời gian cho người thân" },
  { key: "relations", name: "Mối quan hệ", hint: "bạn bè, đồng nghiệp, networking" },
  { key: "work", name: "Công việc", hint: "công việc chính, dự án" },
  { key: "finance", name: "Tài chính", hint: "quản lý tiền, đầu tư" },
  { key: "learning", name: "Học tập", hint: "đọc, khóa học, kỹ năng mới" },
  { key: "leisure", name: "Giải trí", hint: "nghỉ ngơi, sở thích, vui chơi" },
  { key: "meaning", name: "Ý nghĩa & Phát triển", hint: "mục tiêu dài hạn, giá trị sống" },
];

export const DEFAULT_WEIGHT = 3;
export const MOOD_LABELS = ["Tệ", "Uể oải", "Bình thường", "Tốt", "Tuyệt vời"] as const;
