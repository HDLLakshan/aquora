import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateSocietyForm } from "../../../features/societies/forms/CreateSocietyForm";
import { getAuthSession } from "../../../lib/auth/getCurrentUser";
import { getSocieties } from "../../../lib/api/client";
import { isSuperAdmin } from "../../../lib/rbac";

export default async function SocietiesPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  if (!isSuperAdmin(session.user)) {
    if (session.user.societyId) {
      redirect(`/societies/${session.user.societyId}/dashboard`);
    }
    redirect("/dashboard");
  }

  if (!session.accessToken) redirect("/login");
  const token = session.accessToken;
  const societies = token ? await getSocieties(token).catch(() => []) : [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-600">Societies</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">Society command list</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review active societies, open their dashboards, and onboard new boards.
          </p>
        </div>
        <Link
          href="#create"
          className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-sky-100/70 transition hover:bg-sky-50"
        >
          Create Society
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-100/70 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active societies</h2>
            <span className="rounded-full bg-sky-100/80 px-3 py-1 text-xs font-semibold text-sky-700">
              {societies.length} total
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Society</th>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.map((society) => (
                  <tr key={society.id} className="transition hover:bg-sky-50/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/societies/${society.id}/dashboard`}
                        className="font-semibold text-slate-900 hover:text-sky-600"
                      >
                        {society.name}
                      </Link>
                      <p className="text-xs text-slate-500">{society.address ?? "No address"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{society.waterBoardRegNo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          society.isActive
                            ? "bg-emerald-100/80 text-emerald-700"
                            : "bg-rose-100/80 text-rose-700"
                        }`}
                      >
                        {society.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {societies.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-500">
                      No societies found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div id="create" className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-100/70">
          <h2 className="text-lg font-semibold text-slate-900">Create society</h2>
          <p className="mt-1 text-sm text-slate-500">Add a new society and assign billing rules.</p>
          <div className="mt-4">
            <CreateSocietyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
