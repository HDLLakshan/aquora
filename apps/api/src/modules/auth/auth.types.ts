import type { Language, Role } from "@prisma/client";

export type PublicUser = {
  id: string;
  mobileNumber: string;
  fullName: string;
  role: Role;
  preferredLanguage: Language;
  isActive: boolean;
  societyId?: string | null;
  createdAt: string;
};

export type AuthSuccess = {
  user: PublicUser;
  accessToken: string;
};
