"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { SocietySummary } from "@aquora/shared";

import { LogoutButton } from "../auth/LogoutButton";
import { SidebarNav, type SidebarItem } from "./SidebarNav";
import { SocietySwitcher } from "../../features/societies/SocietySwitcher";
import { isSuperAdmin } from "../../lib/rbac";

interface PortalShellProps {
  user: {
    name?: string | null;
    role?: string;
    effectiveRole?: string;
    societyId?: string | null;
  };
  societies: SocietySummary[];
  currentSocietyName?: string | null;
  children: ReactNode;
}

export function PortalShell({
  user,
  societies,
  currentSocietyName,
  children
}: PortalShellProps) {
  const params = useParams();
  const paramSocietyId = typeof params?.societyId === "string" ? params.societyId : null;
  const activeSocietyId = paramSocietyId ?? user.societyId ?? null;
  const superAdmin = isSuperAdmin(user);

  const baseSocietyPath = activeSocietyId ? `/societies/${activeSocietyId}` : null;

  const navItems: SidebarItem[] = [];

  if (superAdmin) {
    navItems.push({ label: "Societies", href: "/societies" });
  }

  if (baseSocietyPath) {
    navItems.push(
      { label: "Dashboard", href: `${baseSocietyPath}/dashboard` },
      { label: "Users", href: `${baseSocietyPath}/users` },
      { label: "Officers", href: `${baseSocietyPath}/officers` },
      { label: "Society Settings", href: `${baseSocietyPath}/settings` }
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_55%),_radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_45%)]">
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/40 bg-white/60 px-6 py-8 shadow-[0_25px_80px_-50px_rgba(14,165,233,0.6)] backdrop-blur lg:flex">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-200">
              AQ
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">Aquora</p>
              <p className="text-sm font-semibold text-slate-900">Command Center</p>
            </div>
          </Link>

          <div className="mt-8">
            <SocietySwitcher
              societies={societies}
              activeSocietyId={activeSocietyId}
              currentSocietyName={currentSocietyName ?? null}
              isSuperAdmin={superAdmin}
            />
          </div>

          <div className="mt-8 flex-1">
            <SidebarNav items={navItems} />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Signed in</p>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.name ?? "Operator"}</p>
              <p className="text-xs text-slate-500">
                {(user.effectiveRole ?? user.role ?? "member").toLowerCase().replace(/_/g, " ")}
              </p>
            </div>
            <LogoutButton variant="outline" size="sm" />
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/40 bg-white/70 px-6 py-4 backdrop-blur lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">Aquora</p>
              <p className="text-sm font-semibold text-slate-900">Portal</p>
            </div>
            <LogoutButton variant="outline" size="sm" />
          </header>

          <div className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
