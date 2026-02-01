import { redirect } from "next/navigation";

import { SocietySettingsForm } from "../../../../../features/societies/forms/SocietySettingsForm";
import { getAuthSession } from "../../../../../lib/auth/getCurrentUser";
import { getSocietyById } from "../../../../../lib/api/client";

export default async function SocietySettingsPage({
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
  try {
    society = await getSocietyById(token, societyId);
  } catch {
    redirect("/societies");
  }
  if (!society) redirect("/societies");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-sky-600">Society settings</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">{society.name}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Update registration details and billing cadence for this society.
        </p>
      </header>

      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-100/70">
        <SocietySettingsForm society={society} />
      </div>
    </div>
  );
}
