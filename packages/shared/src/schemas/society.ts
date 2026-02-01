import { z } from "zod";

import { UserRoleSchema } from "./user";

const trimmedString = z.string().trim().min(1);

export const SocietyIdSchema = z.string().min(1);
export const AssignmentIdSchema = z.string().min(1);

export const SocietyCreateSchema = z.object({
  name: trimmedString,
  address: z.string().trim().min(1).optional(),
  waterBoardRegNo: trimmedString,
  billingSchemeJson: z.unknown(),
  billingDayOfMonth: z.number().int().min(1).max(31).optional(),
  dueDays: z.number().int().min(0).optional()
});

export type SocietyCreateInput = z.infer<typeof SocietyCreateSchema>;

export const SocietyUpdateSchema = SocietyCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field is required." }
);

export type SocietyUpdateInput = z.infer<typeof SocietyUpdateSchema>;

export const OfficerRoleSchema = z.enum(["PRESIDENT", "SECRETARY"]);
export type OfficerRole = z.infer<typeof OfficerRoleSchema>;

export const OfficerAssignSchema = z.object({
  userId: z.string().min(1),
  role: OfficerRoleSchema
});

export type OfficerAssignInput = z.infer<typeof OfficerAssignSchema>;

export const SocietyUsersQuerySchema = z.object({
  role: UserRoleSchema.optional()
});

export type SocietyUsersQuery = z.infer<typeof SocietyUsersQuerySchema>;

export const SocietySummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1).optional().nullable(),
  waterBoardRegNo: z.string().min(1),
  isActive: z.boolean(),
  billingDayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
  dueDays: z.number().int().min(0).optional().nullable()
});

export type SocietySummary = z.infer<typeof SocietySummarySchema>;

export const OfficerUserSummarySchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  mobileNumber: z.string().min(1),
  role: UserRoleSchema,
  isActive: z.boolean()
});

export type OfficerUserSummary = z.infer<typeof OfficerUserSummarySchema>;

export const OfficerAssignmentSummarySchema = z.object({
  id: z.string().min(1),
  role: UserRoleSchema,
  isActive: z.boolean(),
  assignedAt: z.string().datetime(),
  unassignedAt: z.string().datetime().nullable().optional(),
  user: OfficerUserSummarySchema
});

export type OfficerAssignmentSummary = z.infer<typeof OfficerAssignmentSummarySchema>;

export const SocietyDetailSchema = SocietySummarySchema.extend({
  billingSchemeJson: z.unknown(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  officers: z.array(OfficerAssignmentSummarySchema)
});

export type SocietyDetail = z.infer<typeof SocietyDetailSchema>;

export const SocietyUserSummarySchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  mobileNumber: z.string().min(1),
  role: UserRoleSchema,
  isActive: z.boolean()
});

export type SocietyUserSummary = z.infer<typeof SocietyUserSummarySchema>;
