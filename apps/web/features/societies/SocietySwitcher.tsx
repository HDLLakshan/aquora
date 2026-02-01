"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SocietySummary } from "@aquora/shared";

import { cn } from "../../lib/utils";

interface SocietySwitcherProps {
  societies: SocietySummary[];
  activeSocietyId?: string | null;
  currentSocietyName?: string | null;
  isSuperAdmin: boolean;
}

export function SocietySwitcher({
  societies,
  activeSocietyId,
  currentSocietyName,
  isSuperAdmin
}: SocietySwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const options = useMemo(() => {
    if (!isSuperAdmin) return [];
    return societies.map((society) => ({
      value: society.id,
      label: society.name
    }));
  }, [isSuperAdmin, societies]);

  const handleChange = (value: string) => {
    if (!value) {
      router.push("/societies");
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    const societyIndex = segments.indexOf("societies");
    if (societyIndex !== -1 && segments[societyIndex + 1]) {
      segments[societyIndex + 1] = value;
      router.push(`/${segments.join("/")}`);
      return;
    }

    router.push(`/societies/${value}/dashboard`);
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white/70 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">Society</p>
        <p className="mt-2 text-sm font-semibold text-slate-900">
          {currentSocietyName ?? "Assigned Society"}
        </p>
        {activeSocietyId ? (
          <p className="mt-1 text-xs text-slate-500">ID: {activeSocietyId}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sky-100 bg-white/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">Society switcher</p>
      <div className="mt-3">
        <select
          value={activeSocietyId ?? ""}
          onChange={(event) => handleChange(event.target.value)}
          className={cn(
            "h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold text-slate-900 shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
          )}
        >
          <option value="">All societies</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
