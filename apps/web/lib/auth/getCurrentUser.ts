import { getServerSession } from "next-auth/next";

import { authOptions } from "../auth";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user ?? null;
}

export async function getAccessToken() {
  const session = await getAuthSession();
  return session?.accessToken ?? null;
}
