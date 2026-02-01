import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "../../../../lib/auth/getCurrentUser";
import { canAccessSociety, isSuperAdmin } from "../../../../lib/rbac";

export default async function SocietyScopedLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ societyId: string }>;
}) {
  const { societyId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!canAccessSociety(user, societyId)) {
    if (!isSuperAdmin(user) && user.societyId) {
      redirect(`/societies/${user.societyId}/dashboard`);
    }
    redirect("/societies");
  }

  return <>{children}</>;
}
