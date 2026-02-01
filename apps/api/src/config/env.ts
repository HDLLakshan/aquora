import { z } from "zod";

import "dotenv/config";

import { API_PREFIX } from "./routes";

const booleanFromString = z
  .string()
  .transform((v: string) => v.toLowerCase())
  .pipe(z.enum(["true", "false"]))
  .transform((v: "true" | "false") => v === "true");

const numberFromString = z.string().transform((v: string) => Number(v)).pipe(z.number());

const portSchema = z.number().int().min(1).max(65535);
const daysSchema = z.number().int().min(1).max(365);
const bcryptCostSchema = z.number().int().min(8).max(15);

const envBaseSchema = z.object({
  DATABASE_URL: z.string().min(1),

  PORT: z.string().optional().default("4000").pipe(numberFromString).pipe(portSchema),
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
  TRUST_PROXY: z.string().optional().default("false").pipe(booleanFromString),

  CORS_ORIGIN: z.string().optional().default("http://localhost:3000"),

  AUTH_ACCESS_TOKEN_SECRET: z.string().min(32),
  AUTH_ACCESS_TOKEN_TTL: z.string().optional().default("15m"),

  AUTH_REFRESH_TOKEN_TTL_DAYS: z
    .string()
    .optional()
    .default("30")
    .pipe(numberFromString)
    .pipe(daysSchema),
  AUTH_REFRESH_TOKEN_COOKIE_NAME: z.string().optional().default("refresh_token"),
  AUTH_REFRESH_TOKEN_COOKIE_SECURE: z.string().optional().default("false").pipe(booleanFromString),
  AUTH_REFRESH_TOKEN_COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).optional().default("strict"),
  AUTH_REFRESH_TOKEN_COOKIE_DOMAIN: z.string().optional(),
  AUTH_REFRESH_TOKEN_COOKIE_PATH: z.string().optional().default(API_PREFIX),

  BCRYPT_COST: z.string().optional().default("12").pipe(numberFromString).pipe(bcryptCostSchema)
});

const envSchema = envBaseSchema.superRefine((val: z.infer<typeof envBaseSchema>, ctx: z.RefinementCtx) => {
    if (val.AUTH_REFRESH_TOKEN_COOKIE_SAME_SITE === "none" && !val.AUTH_REFRESH_TOKEN_COOKIE_SECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AUTH_REFRESH_TOKEN_COOKIE_SECURE must be true when AUTH_REFRESH_TOKEN_COOKIE_SAME_SITE=none",
        path: ["AUTH_REFRESH_TOKEN_COOKIE_SECURE"]
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: z.ZodIssue) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = validateEnv();
