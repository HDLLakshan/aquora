import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "../../../../../lib/auth/getCurrentUser";
import { getSocietyById, getSocietyUsers } from "../../../../../lib/api/client";

export default async function SocietyUsersPage({
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
  let users: Awaited<ReturnType<typeof getSocietyUsers>> | null = null;
  try {
    [society, users] = await Promise.all([getSocietyById(token, societyId), getSocietyUsers(token, societyId)]);
  } catch {
    redirect("/societies");
  }
  if (!society || !users) redirect("/societies");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-600">Society users</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">{society.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Manage society staff and field operators.</p>
        </div>
        <Link
          href={`/register?societyId=${society.id}`}
          className="rounded-2xl border border-sky-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-sky-100/70 transition hover:bg-sky-50"
        >
          Create user
        </Link>
      </header>

      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-100/70">
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50/70 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="transition hover:bg-sky-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{user.fullName}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.mobileNumber}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {user.role.toLowerCase().replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-emerald-100/80 text-emerald-700"
                          : "bg-rose-100/80 text-rose-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
