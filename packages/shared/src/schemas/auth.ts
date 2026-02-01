import { z } from "zod";

import { UserIdSchema, UserRoleSchema } from "./user";

// Expected format: 94767804166 (digits only, country code + number)
export const MobileNumberSchema = z.string().trim().regex(/^94\d{9}$/, "Invalid mobile number format");

// bcrypt only uses the first 72 bytes of a password
export const PasswordSchema = z.string().min(8).max(72);

export const RegisterSchema = z.object({
  name: z.string().trim().min(1),
  mobileNumber: MobileNumberSchema,
  password: PasswordSchema
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  mobileNumber: MobileNumberSchema,
  password: PasswordSchema
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const PublicUserSchema = z.object({
  id: UserIdSchema,
  mobileNumber: MobileNumberSchema,
  name: z.string().min(1),
  role: UserRoleSchema,
  createdAt: z.string().datetime()
});

export type PublicUser = z.infer<typeof PublicUserSchema>;

export const AuthSuccessSchema = z.object({
  user: PublicUserSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional()
});

export type AuthSuccess = z.infer<typeof AuthSuccessSchema>;
