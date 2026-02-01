import type { Prisma, Role } from "@prisma/client";

export type SocietyCreateInput = {
  name: string;
  address?: string | null;
  waterBoardRegNo: string;
  billingSchemeJson: Prisma.InputJsonValue;
  billingDayOfMonth?: number | null;
  dueDays?: number | null;
};

export type SocietyUpdateInput = Partial<SocietyCreateInput>;

export type OfficerRole = "PRESIDENT" | "SECRETARY";

export type OfficerAssignInput = {
  userId: string;
  role: OfficerRole;
};

export type SocietySummary = {
  id: string;
  name: string;
  address?: string | null;
  waterBoardRegNo: string;
  isActive: boolean;
  billingDayOfMonth?: number | null;
  dueDays?: number | null;
};

export type OfficerUserSummary = {
  id: string;
  fullName: string;
  mobileNumber: string;
  role: Role;
  isActive: boolean;
};

export type OfficerAssignmentSummary = {
  id: string;
  role: Role;
  isActive: boolean;
  assignedAt: string;
  unassignedAt?: string | null;
  user: OfficerUserSummary;
};

export type SocietyDetail = SocietySummary & {
  billingSchemeJson: Prisma.JsonValue;
  createdAt: string;
  updatedAt: string;
  officers: OfficerAssignmentSummary[];
};

export type SocietyUserSummary = {
  id: string;
  fullName: string;
  mobileNumber: string;
  role: Role;
  isActive: boolean;
};
