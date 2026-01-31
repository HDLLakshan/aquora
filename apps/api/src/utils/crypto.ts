import crypto from "node:crypto";

import bcrypt from "bcryptjs";

import { env } from "../config/env";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.BCRYPT_COST);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function createRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString("base64url");
}

export function hashToken(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
