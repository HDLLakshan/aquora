import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SessionProvider } from "../../components/auth/SessionProvider";
import { PortalShell } from "../../components/layout/PortalShell";
import { getAuthSession } from "../../lib/auth/getCurrentUser";
import { getSocieties, getSocietyById } from "../../lib/api/client";
import { isSuperAdmin } from "../../lib/rbac";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }
  if (!session.accessToken) {
    redirect("/login");
  }

  const accessToken = session.accessToken;
  let societies: Awaited<ReturnType<typeof getSocieties>> = [];
  let currentSocietyName: string | null = null;

  if (isSuperAdmin(session.user)) {
    if (accessToken) {
      societies = await getSocieties(accessToken).catch(() => []);
    }
  } else if (session.user.societyId && accessToken) {
    const society = await getSocietyById(accessToken, session.user.societyId).catch(() => null);
    currentSocietyName = society?.name ?? null;
  }

  return (
    <SessionProvider session={session}>
      <PortalShell user={session.user} societies={societies} currentSocietyName={currentSocietyName}>
        {children}
      </PortalShell>
    </SessionProvider>
  );
}
