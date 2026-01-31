import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/errors";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code, details: err.details }
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { message: "Internal server error" }
  });
}
