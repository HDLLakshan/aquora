import { z } from "zod";
import { Role } from "@prisma/client";

const trimmedString = z.string().trim().min(1);

export const societyIdParamSchema = z.string().min(1);
export const assignmentIdParamSchema = z.string().min(1);

export const createSocietyBodySchema = z.object({
  name: trimmedString,
  address: z.string().trim().min(1).optional(),
  waterBoardRegNo: trimmedString,
  billingSchemeJson: z.unknown(),
  billingDayOfMonth: z.number().int().min(1).max(31).optional(),
  dueDays: z.number().int().min(0).optional()
});

export const updateSocietyBodySchema = createSocietyBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required." });

export const officerAssignBodySchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["PRESIDENT", "SECRETARY"])
});

export const societyUsersQuerySchema = z.object({
  role: z.nativeEnum(Role).optional()
});
