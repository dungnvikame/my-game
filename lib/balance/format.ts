/** 45 → "45p", 60 → "1h", 90 → "1h30". */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}p`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
