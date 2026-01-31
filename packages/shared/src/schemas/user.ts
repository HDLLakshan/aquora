import { z } from "zod";

export const UserIdSchema = z.string().min(1);

export const UserRoleValues = ["super_admin", "secratary", "president", "meter_reader"] as const;
export const UserRoleSchema = z.enum(UserRoleValues);

export const UserSchema = z.object({
  id: UserIdSchema,
  name: z.string().min(1),
  role: UserRoleSchema,
  createdAt: z.string().datetime()
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  role: UserRoleSchema.optional()
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
