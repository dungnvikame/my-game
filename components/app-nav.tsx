"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ChartPie, ClipboardList } from "lucide-react";

const TABS = [
  { href: "/checkin", label: "Hôm nay", Icon: CalendarCheck },
  { href: "/dashboard", label: "Dashboard", Icon: ChartPie },
  { href: "/review", label: "Review", Icon: ClipboardList },
] as const;

// Bottom nav cố định: chuẩn mobile (icon + label, ≤5 mục), safe-area aware.
// Trang nào dùng nav này cần chừa pb-24 cho nội dung.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-150 ${
                active ? "text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
