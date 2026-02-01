import { redirect } from "next/navigation";

import { OfficersPanel } from "../../../../../features/societies/OfficersPanel";
import { getAuthSession } from "../../../../../lib/auth/getCurrentUser";
import { getOfficers, getSocietyById } from "../../../../../lib/api/client";

export default async function OfficersPage({
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
    [society, officers] = await Promise.all([getSocietyById(token, societyId), getOfficers(token, societyId)]);
  } catch {
    redirect("/societies");
  }
  if (!society || !officers) redirect("/societies");

  return (
    <OfficersPanel societyId={society.id} societyName={society.name} initialOfficers={officers} />
  );
}
