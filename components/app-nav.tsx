"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/checkin", label: "Hôm nay" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/review", label: "Review" },
] as const;

// Thanh điều hướng chính giữa 3 màn — tap-friendly trên mobile.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-md gap-1.5 px-4 pt-4">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
              active
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 active:bg-neutral-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
