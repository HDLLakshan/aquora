import type { Prisma, RefreshToken, SocietyRoleAssignment, User } from "@prisma/client";

import { prisma } from "../../config/database";

export class AuthRepository {
  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  findUserByMobileNumber(mobileNumber: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { mobileNumber } });
  }

  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  findActiveSocietyRoleAssignment(userId: string): Promise<SocietyRoleAssignment | null> {
    return prisma.societyRoleAssignment.findFirst({ where: { userId, isActive: true }, orderBy: { assignedAt: "desc" } });
  }

  createRefreshToken(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  revokeRefreshToken(
    id: string,
    data: { revokedAt: Date; replacedByTokenId: string | null }
  ): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: data.revokedAt,
        replacedByToken: data.replacedByTokenId ? { connect: { id: data.replacedByTokenId } } : { disconnect: true }
      }
    });
  }
}
