import type { NextFunction, Request, Response } from "express";

import { env } from "../../config/env";
import { ApiError } from "../../utils/errors";
import type { AuthService } from "./auth.service";

function getRequestContext(req: Request): { ipAddress?: string; userAgent?: string } {
  const ctx: { ipAddress?: string; userAgent?: string } = {};
  if (req.ip) ctx.ipAddress = req.ip;
  const userAgent = req.header("user-agent");
  if (userAgent) ctx.userAgent = userAgent;
  return ctx;
}

function setRefreshCookie(res: Response, refreshTokenValue: string) {
  res.cookie(env.AUTH_REFRESH_TOKEN_COOKIE_NAME, refreshTokenValue, {
    httpOnly: true,
    secure: env.AUTH_REFRESH_TOKEN_COOKIE_SECURE,
    sameSite: env.AUTH_REFRESH_TOKEN_COOKIE_SAME_SITE,
    domain: env.AUTH_REFRESH_TOKEN_COOKIE_DOMAIN,
    path: env.AUTH_REFRESH_TOKEN_COOKIE_PATH,
    maxAge: env.AUTH_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(env.AUTH_REFRESH_TOKEN_COOKIE_NAME, {
    domain: env.AUTH_REFRESH_TOKEN_COOKIE_DOMAIN,
    path: env.AUTH_REFRESH_TOKEN_COOKIE_PATH
  });
}

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth, refreshTokenValue } = await this.authService.register(req.body, getRequestContext(req));
      setRefreshCookie(res, refreshTokenValue);
      return res.status(201).json({ success: true, data: auth });
    } catch (err) {
      return next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auth, refreshTokenValue } = await this.authService.login(req.body, getRequestContext(req));
      setRefreshCookie(res, refreshTokenValue);
      return res.status(200).json({ success: true, data: auth });
    } catch (err) {
      return next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshTokenValue = req.cookies?.[env.AUTH_REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
      if (!refreshTokenValue) {
        throw new ApiError(401, "Missing refresh token");
      }

      const { auth, refreshTokenValue: rotated } = await this.authService.refresh(
        refreshTokenValue,
        getRequestContext(req)
      );
      setRefreshCookie(res, rotated);
      return res.status(200).json({ success: true, data: auth });
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        clearRefreshCookie(res);
      }
      return next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshTokenValue = req.cookies?.[env.AUTH_REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
      await this.authService.logout(refreshTokenValue);
      clearRefreshCookie(res);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw new ApiError(401, "Unauthorized");
      }
      const user = await this.authService.me(req.auth.userId);
      return res.json({ success: true, data: user });
    } catch (err) {
      return next(err);
    }
  };
}
