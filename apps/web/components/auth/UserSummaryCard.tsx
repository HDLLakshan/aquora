"use client";

import { useSession } from "next-auth/react";

export function UserSummaryCard() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) return null;

  return (
    <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-600">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Name</span>
        <span>{user.name ?? "—"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Mobile</span>
        <span>{user.mobileNumber}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Role</span>
        <span className="capitalize">{user.role.replace(/_/g, " ")}</span>
      </div>
    </div>
  );
}
