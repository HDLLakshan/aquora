import { redirect } from "next/navigation";

import { getCurrentUser } from "../../../lib/auth/getCurrentUser";
import { isSuperAdmin } from "../../../lib/rbac";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (isSuperAdmin(user)) {
    redirect("/societies");
  }

  if (user.societyId) {
    redirect(`/societies/${user.societyId}/dashboard`);
  }

  redirect("/societies");
}
