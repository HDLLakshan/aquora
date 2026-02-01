import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (!token) {
    return next(new ApiError(401, "Missing access token"));
  }

  try {
    const claims = verifyAccessToken(token);
    req.auth = {
      userId: claims.sub,
      mobileNumber: claims.mobileNumber,
      effectiveRole: claims.effectiveRole,
      societyId: claims.societyId
    };
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
}

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) {
    return next(new ApiError(401, "Unauthorized"));
  }
  if (req.auth.effectiveRole !== "SUPER_ADMIN") {
    return next(new ApiError(403, "Forbidden"));
  }
  return next();
}
