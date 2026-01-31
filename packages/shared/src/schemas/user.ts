import { z } from "zod";

export const UserIdSchema = z.string().min(1);

export const UserSchema = z.object({
  id: UserIdSchema,
  name: z.string().min(1),
  createdAt: z.string().datetime()
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  name: z.string().min(1)
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

