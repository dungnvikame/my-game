"use client";

import { useState } from "react";
import type { LifeArea } from "@/lib/areas";
import { TapChip } from "@/components/tap-chip";

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
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{area.name}</span>
        <span className="text-xs tabular-nums text-faint">
          {hours.toFixed(1)}h trong tuần
        </span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1 min-[400px]:grid-cols-10">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
          <TapChip
            key={level}
            selected={value === level}
            onClick={() => setValue(level)}
            ariaLabel={`${area.name}: điểm ${level}`}
            className="rounded-lg px-0 text-xs"
          >
            {level}
          </TapChip>
        ))}
      </div>
      <input type="hidden" name={`score_${area.key}`} value={value} />
    </div>
  );
}
