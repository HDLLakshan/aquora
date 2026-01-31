import type { Role } from "@prisma/client";

export type PublicUser = {
  id: string;
  mobileNumber: string;
  name: string;
  role: Role;
  createdAt: string;
};

export type AuthSuccess = {
  user: PublicUser;
  accessToken: string;
};
