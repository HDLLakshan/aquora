import { createRequire } from "node:module";
import type { Secret, SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import type * as JsonWebToken from "jsonwebtoken";

import { env } from "../config/env";

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken") as typeof JsonWebToken;

export type AccessTokenClaims = {
  sub: string;
  mobileNumber: string;
  effectiveRole: Role;
  societyId: string | null;
};

export function signAccessToken(claims: AccessTokenClaims): string {
  const secret: Secret = env.AUTH_ACCESS_TOKEN_SECRET;
  const options: SignOptions = {
    expiresIn: env.AUTH_ACCESS_TOKEN_TTL as unknown as NonNullable<SignOptions["expiresIn"]>
  };
  return jwt.sign(claims, secret, options);
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const secret: Secret = env.AUTH_ACCESS_TOKEN_SECRET;
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }
  const sub = decoded.sub;
  const mobileNumber = (decoded as { mobileNumber?: unknown }).mobileNumber;
  const effectiveRole = (decoded as { effectiveRole?: unknown }).effectiveRole;
  const societyId = (decoded as { societyId?: unknown }).societyId;
  if (typeof sub !== "string" || typeof mobileNumber !== "string") {
    throw new Error("Invalid token payload");
  }
  if (typeof effectiveRole !== "string") {
    throw new Error("Invalid token payload");
  }
  if (societyId !== null && societyId !== undefined && typeof societyId !== "string") {
    throw new Error("Invalid token payload");
  }
  if (!Object.values(Role).includes(effectiveRole as Role)) {
    throw new Error("Invalid token payload");
  }
  return { sub, mobileNumber, effectiveRole: effectiveRole as Role, societyId: societyId ?? null };
}
