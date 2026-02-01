import { z } from "zod";

export const UserIdSchema = z.string().min(1);

export const UserRoleValues = [
  "SUPER_ADMIN",
  "PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "METER_READER"
] as const;
export const UserRoleSchema = z.enum(UserRoleValues, {
  message: "Role is required."
});

export const LanguageValues = ["EN", "SI", "TA"] as const;
export const LanguageSchema = z.enum(LanguageValues);

export const UserSchema = z.object({
  id: UserIdSchema,
  fullName: z.string().min(1),
  mobileNumber: z.string().min(1),
  role: UserRoleSchema,
  preferredLanguage: LanguageSchema,
  isActive: z.boolean(),
  societyId: z.string().min(1).optional().nullable(),
  createdAt: z.string().datetime()
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  fullName: z.string().min(1),
  role: UserRoleSchema,
  preferredLanguage: LanguageSchema.optional()
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
