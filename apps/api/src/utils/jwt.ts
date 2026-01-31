import { createRequire } from "node:module";
import type { Secret, SignOptions } from "jsonwebtoken";
import type * as JsonWebToken from "jsonwebtoken";

import { env } from "../config/env";

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken") as typeof JsonWebToken;

export type AccessTokenClaims = {
  sub: string;
  mobileNumber: string;
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
  if (typeof sub !== "string" || typeof mobileNumber !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub, mobileNumber };
}
