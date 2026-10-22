"use client";

import { useState } from "react";
import type { LifeArea } from "@/lib/areas";
import { TapChip } from "@/components/tap-chip";

// Một hàng chọn trọng số 1-5 bằng tap, không gõ.
export function WeightRow({ area, initial }: { area: LifeArea; initial: number }) {
  const [value, setValue] = useState(initial);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{area.name}</span>
        <span className="text-xs text-faint">{area.hint}</span>
      </div>
      <input type="hidden" name={`weight_${area.key}`} value={value} />
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <TapChip
            key={level}
            selected={value === level}
            onClick={() => setValue(level)}
            ariaLabel={`${area.name}: mức ${level}`}
          >
            {level}
          </TapChip>
        ))}
      </div>
    </div>
  );
}
