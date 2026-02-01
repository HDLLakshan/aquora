import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "../../../../../lib/auth/getCurrentUser";
import { getOfficers, getSocietyById } from "../../../../../lib/api/client";

export default async function SocietyDashboardPage({
  params
}: {
  params: Promise<{ societyId: string }>;
}) {
  const { societyId } = await params;
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");
  if (!session.accessToken) redirect("/login");
  const token = session.accessToken;
  let society: Awaited<ReturnType<typeof getSocietyById>> | null = null;
  let officers: Awaited<ReturnType<typeof getOfficers>> | null = null;
  try {
    society = await getSocietyById(token, societyId);
    officers = await getOfficers(token, societyId);
  } catch {
    redirect("/societies");
  }
  if (!society || !officers) {
    redirect("/societies");
  }

  const president = officers.find((officer) => officer.role === "PRESIDENT");
  const secretary = officers.find((officer) => officer.role === "SECRETARY");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-600">Society dashboard</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">{society.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Registration {society.waterBoardRegNo} · {society.isActive ? "Active" : "Inactive"}
          </p>
        </div>
        <Link
          href={`/societies/${society.id}/settings`}
          className="rounded-2xl border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-sky-100/70 transition hover:bg-sky-50"
        >
          Edit settings
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-100/70">
          <h2 className="text-lg font-semibold text-slate-900">Society summary</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-sky-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {society.address ?? "No address provided"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-sky-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Billing cadence</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Day {society.billingDayOfMonth ?? "—"} · Due in {society.dueDays ?? "—"} days
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-sky-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Preferred officers</p>
              <p className="mt-2 text-sm text-slate-900">
                President: {president?.user.fullName ?? "Not assigned"}
              </p>
              <p className="text-sm text-slate-500">
                Secretary: {secretary?.user.fullName ?? "Not assigned"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-sky-50/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Created</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {new Date(society.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-100/70">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Leadership</h2>
            <Link
              href={`/societies/${society.id}/officers`}
              className="text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              Manage
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">President</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {president?.user.fullName ?? "Not assigned"}
              </p>
              <p className="text-xs text-slate-500">{president?.user.mobileNumber ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Secretary</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {secretary?.user.fullName ?? "Not assigned"}
              </p>
              <p className="text-xs text-slate-500">{secretary?.user.mobileNumber ?? "—"}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
