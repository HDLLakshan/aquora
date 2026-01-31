import type { RefreshToken, User } from "@prisma/client";
import type { LoginInput, RegisterInput } from "@aquora/shared";

import { env } from "../../config/env";
import { createRefreshTokenValue, hashPassword, hashToken, verifyPassword } from "../../utils/crypto";
import { ApiError } from "../../utils/errors";
import { signAccessToken } from "../../utils/jwt";
import type { AuthSuccess, PublicUser } from "./auth.types";
import { AuthRepository } from "./auth.repository";

type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async register(input: RegisterInput, ctx: RequestContext): Promise<{
    auth: AuthSuccess;
    refreshTokenValue: string;
  }> {
    const existing = await this.repo.findUserByMobileNumber(input.mobileNumber);
    if (existing) {
      throw new ApiError(409, "Mobile number already in use");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.createUser({
      mobileNumber: input.mobileNumber,
      name: input.name,
      passwordHash
    });

    return this.issueTokensForUser(user, ctx);
  }

  async login(input: LoginInput, ctx: RequestContext): Promise<{
    auth: AuthSuccess;
    refreshTokenValue: string;
  }> {
    const user = await this.repo.findUserByMobileNumber(input.mobileNumber);
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      throw new ApiError(401, "Invalid credentials");
    }

    return this.issueTokensForUser(user, ctx);
  }

  async refresh(refreshTokenValue: string, ctx: RequestContext): Promise<{
    auth: AuthSuccess;
    refreshTokenValue: string;
  }> {
    const tokenHash = hashToken(refreshTokenValue);
    const stored = await this.repo.findRefreshTokenByHash(tokenHash);
    if (!stored || stored.revokedAt) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new ApiError(401, "Expired refresh token");
    }

    const user = await this.repo.findUserById(stored.userId);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const rotated = await this.rotateRefreshToken(stored, ctx);
    const auth = this.createAuthSuccess(user);
    return { auth, refreshTokenValue: rotated.value };
  }

  async logout(refreshTokenValue: string | undefined): Promise<void> {
    if (!refreshTokenValue) return;
    const tokenHash = hashToken(refreshTokenValue);
    const stored = await this.repo.findRefreshTokenByHash(tokenHash);
    if (!stored || stored.revokedAt) return;

    await this.repo.revokeRefreshToken(stored.id, { revokedAt: new Date(), replacedByTokenId: null });
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return this.toPublicUser(user);
  }

  private async issueTokensForUser(user: User, ctx: RequestContext) {
    const refreshTokenValue = createRefreshTokenValue();
    const refreshTokenHash = hashToken(refreshTokenValue);

    await this.repo.createRefreshToken({
      tokenHash: refreshTokenHash,
      expiresAt: this.refreshExpiryDate(),
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      user: { connect: { id: user.id } }
    });

    const auth = this.createAuthSuccess(user);
    return { auth, refreshTokenValue };
  }

  private async rotateRefreshToken(stored: RefreshToken, ctx: RequestContext) {
    const value = createRefreshTokenValue();
    const tokenHash = hashToken(value);

    const newToken = await this.repo.createRefreshToken({
      tokenHash,
      expiresAt: this.refreshExpiryDate(),
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
      user: { connect: { id: stored.userId } }
    });

    await this.repo.revokeRefreshToken(stored.id, {
      revokedAt: new Date(),
      replacedByTokenId: newToken.id
    });

    return { value, tokenHash, id: newToken.id };
  }

  private createAuthSuccess(user: User): AuthSuccess {
    const accessToken = signAccessToken({ sub: user.id, mobileNumber: user.mobileNumber });
    return { user: this.toPublicUser(user), accessToken };
  }

  private refreshExpiryDate(): Date {
    const ms = env.AUTH_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString()
    };
  }
}
