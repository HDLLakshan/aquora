import type {
  Prisma,
  PrismaClient,
  Role,
  Society,
  SocietyRoleAssignment,
  User
} from "@prisma/client";

import { prisma } from "../../config/database";

type DbClient = PrismaClient | Prisma.TransactionClient;

type OfficerAssignment = SocietyRoleAssignment & { user: User };

export class SocietiesRepository {
  private getClient(client?: DbClient) {
    return client ?? prisma;
  }

  createSociety(data: Prisma.SocietyCreateInput, client?: DbClient): Promise<Society> {
    return this.getClient(client).society.create({ data });
  }

  listSocieties(client?: DbClient): Promise<Society[]> {
    return this.getClient(client).society.findMany({ orderBy: { createdAt: "desc" } });
  }

  findSocietyById(id: string, client?: DbClient): Promise<Society | null> {
    return this.getClient(client).society.findUnique({ where: { id } });
  }

  updateSociety(id: string, data: Prisma.SocietyUpdateInput, client?: DbClient): Promise<Society> {
    return this.getClient(client).society.update({ where: { id }, data });
  }

  findUserById(id: string, client?: DbClient): Promise<User | null> {
    return this.getClient(client).user.findUnique({ where: { id } });
  }

  updateUserSociety(id: string, societyId: string, updatedBy: string, client?: DbClient): Promise<User> {
    return this.getClient(client).user.update({
      where: { id },
      data: { societyId, updatedBy }
    });
  }

  listActiveOfficers(societyId: string, client?: DbClient): Promise<OfficerAssignment[]> {
    return this.getClient(client).societyRoleAssignment.findMany({
      where: {
        societyId,
        isActive: true,
        role: { in: ["PRESIDENT", "SECRETARY"] }
      },
      include: {
        user: true
      },
      orderBy: { assignedAt: "desc" }
    });
  }

  deactivateActiveAssignments(societyId: string, role: Role, client?: DbClient) {
    return this.getClient(client).societyRoleAssignment.updateMany({
      where: {
        societyId,
        role,
        isActive: true
      },
      data: {
        isActive: false,
        unassignedAt: new Date()
      }
    });
  }

  createAssignment(data: Prisma.SocietyRoleAssignmentCreateInput, client?: DbClient): Promise<SocietyRoleAssignment> {
    return this.getClient(client).societyRoleAssignment.create({ data });
  }

  findAssignmentById(id: string, client?: DbClient): Promise<SocietyRoleAssignment | null> {
    return this.getClient(client).societyRoleAssignment.findUnique({ where: { id } });
  }

  deactivateAssignment(id: string, client?: DbClient): Promise<SocietyRoleAssignment> {
    return this.getClient(client).societyRoleAssignment.update({
      where: { id },
      data: {
        isActive: false,
        unassignedAt: new Date()
      }
    });
  }

  listUsersBySocietyAndRole(
    societyId: string,
    role: Role | undefined,
    client?: DbClient
  ): Promise<Array<Pick<User, "id" | "fullName" | "mobileNumber" | "role" | "isActive">>> {
    return this.getClient(client).user.findMany({
      where: {
        societyId,
        ...(role ? { role } : {})
      },
      select: {
        id: true,
        fullName: true,
        mobileNumber: true,
        role: true,
        isActive: true
      },
      orderBy: { fullName: "asc" }
    });
  }
}
