"use client";

// Chip chọn bằng tap — dùng chung cho mood, trọng số, điểm review, chọn mảng.
// Min-height 44px (touch target), scale feedback khi nhấn, không đổi layout.
export function TapChip({
  selected,
  onClick,
  ariaLabel,
  className = "",
  children,
}: {
  selected: boolean;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`min-h-11 cursor-pointer rounded-xl text-sm font-medium transition-[background-color,color,transform] duration-150 active:scale-95 ${
        selected
          ? "bg-primary font-semibold text-primary-fg shadow-sm"
          : "bg-surface-2 text-muted hover:text-foreground active:bg-border"
      } ${className}`}
    >
      {children}
    </button>
  );
}
