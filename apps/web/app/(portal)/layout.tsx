import type { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { SessionProvider } from "../../components/auth/SessionProvider";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-slate-50/60">{children}</div>
    </SessionProvider>
  );
}
