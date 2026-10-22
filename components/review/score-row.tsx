"use client";

import { useState } from "react";
import type { LifeArea } from "@/lib/areas";

// Một hàng tự chấm 1-10 bằng tap, đặt cạnh số giờ thực tế của tuần
// để tự thấy lệch giữa cảm nhận và hành vi.
export function ScoreRow({
  area,
  hours,
  initial,
}: {
  area: LifeArea;
  hours: number;
  initial: number;
}) {
  const [value, setValue] = useState(initial);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{area.name}</span>
        <span className="text-xs tabular-nums text-neutral-400">
          {hours.toFixed(1)}h trong tuần
        </span>
      </div>
      <input type="hidden" name={`score_${area.key}`} value={value} />
      <div className="mt-2 grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
          <button
            key={level}
            type="button"
            aria-label={`${area.name}: điểm ${level}`}
            aria-pressed={value === level}
            onClick={() => setValue(level)}
            className={`rounded-md py-2 text-xs font-medium transition-colors ${
              value === level
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 active:bg-neutral-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
