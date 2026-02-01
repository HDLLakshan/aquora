"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../../lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  hint?: string;
}

export function SidebarNav({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold transition",
              isActive
                ? "border-sky-200/70 bg-white/80 text-slate-900 shadow-sm shadow-sky-100/70"
                : "text-slate-600 hover:border-sky-100 hover:bg-sky-50/80 hover:text-slate-900"
            )}
          >
            <span>{item.label}</span>
            {item.hint ? (
              <span className="rounded-full bg-sky-100/70 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                {item.hint}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
