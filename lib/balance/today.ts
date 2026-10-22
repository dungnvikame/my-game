// Nguồn duy nhất cho "hôm nay" — app cá nhân, múi giờ cố định Asia/Ho_Chi_Minh.
// Tránh lệch 7h khi server chạy UTC (Vercel): mọi page/action đều lấy ngày từ đây.

const TIME_ZONE = "Asia/Ho_Chi_Minh";

/** "YYYY-MM-DD" theo giờ Việt Nam, bất kể timezone của server. */
export function todayYMD(): string {
  // en-CA cho sẵn định dạng YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/** Date tại 00:00 (giờ process) của ngày Việt Nam hiện tại — dùng cho weekday/tuần ISO. */
export function todayDate(): Date {
  return new Date(`${todayYMD()}T00:00:00`);
}

/** "YYYY-MM-DD" từ một Date theo getters local — đối xứng với todayDate(). */
export function ymdLocal(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}
