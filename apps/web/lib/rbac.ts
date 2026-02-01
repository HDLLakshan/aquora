export type AuthUser = {
  role?: string;
  effectiveRole?: string;
  societyId?: string | null;
};

export function isSuperAdmin(user: AuthUser | null | undefined) {
  return user?.effectiveRole === "SUPER_ADMIN" || user?.role === "SUPER_ADMIN";
}

export function isOfficer(user: AuthUser | null | undefined) {
  return user?.effectiveRole === "PRESIDENT" || user?.effectiveRole === "SECRETARY";
}

export function canAccessSociety(user: AuthUser | null | undefined, societyId: string) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return user.societyId === societyId;
}
