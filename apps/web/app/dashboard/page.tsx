import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { LogoutButton } from "../../components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-sky-100/70 backdrop-blur">
        <p className="text-sm font-semibold text-sky-600">Dashboard</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Welcome back, {session.user.name ?? "there"}.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your dashboard is ready for the next phase. We&apos;ll populate it soon.
        </p>
        <div className="mt-6">
          <LogoutButton size="md" />
        </div>
      </div>
    </div>
  );
}
