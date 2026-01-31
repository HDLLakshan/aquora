import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

import { ApiError } from "../utils/errors";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError(400, "Invalid request body", {
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten()
        })
      );
    }
    req.body = parsed.data;
    return next();
  };
}
