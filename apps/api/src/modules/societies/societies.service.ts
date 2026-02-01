import type { Prisma, Role, Society, SocietyRoleAssignment, User } from "@prisma/client";

import { prisma } from "../../config/database";
import { ApiError } from "../../utils/errors";
import type {
  OfficerAssignInput,
  OfficerAssignmentSummary,
  SocietyCreateInput,
  SocietyDetail,
  SocietySummary,
  SocietyUpdateInput,
  SocietyUserSummary
} from "./societies.types";
import type { SocietiesRepository } from "./societies.repository";

type RequestContext = {
  actorId: string;
};

type TransactionRunner = <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) => Promise<T>;

export class SocietiesService {
  constructor(
    private repo: SocietiesRepository,
    private runInTransaction: TransactionRunner = prisma.$transaction.bind(prisma)
  ) {}

  async createSociety(input: SocietyCreateInput, ctx: RequestContext): Promise<SocietySummary> {
    const society = await this.repo.createSociety(
      {
        name: input.name,
        address: input.address ?? null,
        waterBoardRegNo: input.waterBoardRegNo,
        billingSchemeJson: input.billingSchemeJson,
        billingDayOfMonth: input.billingDayOfMonth ?? null,
        dueDays: input.dueDays ?? null,
        createdBy: ctx.actorId
      },
      undefined
    );

    return this.toSocietySummary(society);
  }

  async listSocieties(): Promise<SocietySummary[]> {
    const societies = await this.repo.listSocieties();
    return societies.map((society) => this.toSocietySummary(society));
  }

  async getSocietyDetail(societyId: string): Promise<SocietyDetail> {
    const society = await this.repo.findSocietyById(societyId);
    if (!society) {
      throw new ApiError(404, "Society not found");
    }

    const officers = await this.getActiveOfficers(societyId);

    return {
      ...this.toSocietySummary(society),
      billingSchemeJson: society.billingSchemeJson,
      createdAt: society.createdAt.toISOString(),
      updatedAt: society.updatedAt.toISOString(),
      officers
    };
  }

  async updateSociety(societyId: string, input: SocietyUpdateInput, ctx: RequestContext): Promise<SocietySummary> {
    const society = await this.repo.findSocietyById(societyId);
    if (!society) {
      throw new ApiError(404, "Society not found");
    }

    const data: Parameters<SocietiesRepository["updateSociety"]>[1] = {
      updatedBy: ctx.actorId
    };

    if (input.name !== undefined) data.name = input.name;
    if (input.address !== undefined) data.address = input.address;
    if (input.waterBoardRegNo !== undefined) data.waterBoardRegNo = input.waterBoardRegNo;
    if (input.billingSchemeJson !== undefined) data.billingSchemeJson = input.billingSchemeJson;
    if (input.billingDayOfMonth !== undefined) data.billingDayOfMonth = input.billingDayOfMonth;
    if (input.dueDays !== undefined) data.dueDays = input.dueDays;

    const updated = await this.repo.updateSociety(societyId, data);

    return this.toSocietySummary(updated);
  }

  async getActiveOfficers(societyId: string, client?: Prisma.TransactionClient): Promise<OfficerAssignmentSummary[]> {
    const officers = await this.repo.listActiveOfficers(societyId, client);
    return officers.map((assignment) => this.toOfficerAssignmentSummary(assignment));
  }

  async assignOfficer(
    societyId: string,
    input: OfficerAssignInput,
    ctx: RequestContext
  ): Promise<{ assignment: OfficerAssignmentSummary; officers: OfficerAssignmentSummary[] }> {
    return this.runInTransaction(async (tx) => {
      const society = await this.repo.findSocietyById(societyId, tx);
      if (!society) {
        throw new ApiError(404, "Society not found");
      }
      if (!society.isActive) {
        throw new ApiError(400, "Society is inactive");
      }

      const user = await this.repo.findUserById(input.userId, tx);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (user.societyId && user.societyId !== societyId) {
        throw new ApiError(400, "User belongs to a different society");
      }

      if (!user.societyId) {
        await this.repo.updateUserSociety(user.id, societyId, ctx.actorId, tx);
      }

      await this.repo.deactivateActiveAssignments(societyId, input.role, tx);

      const created = await this.repo.createAssignment(
        {
          society: { connect: { id: societyId } },
          user: { connect: { id: user.id } },
          role: input.role,
          isActive: true,
          assignedAt: new Date()
        },
        tx
      );

      const officers = await this.getActiveOfficers(societyId, tx);

      return {
        assignment: this.toOfficerAssignmentSummary({ ...created, user }),
        officers
      };
    });
  }

  async deactivateOfficer(
    societyId: string,
    assignmentId: string
  ): Promise<{ officers: OfficerAssignmentSummary[] }> {
    return this.runInTransaction(async (tx) => {
      const assignment = await this.repo.findAssignmentById(assignmentId, tx);
      if (!assignment || assignment.societyId !== societyId) {
        throw new ApiError(404, "Assignment not found");
      }

      await this.repo.deactivateAssignment(assignmentId, tx);

      const officers = await this.getActiveOfficers(societyId, tx);
      return { officers };
    });
  }

  async listUsers(societyId: string, role?: Role): Promise<SocietyUserSummary[]> {
    return this.repo.listUsersBySocietyAndRole(societyId, role);
  }

  private toSocietySummary(society: Society): SocietySummary {
    return {
      id: society.id,
      name: society.name,
      address: society.address,
      waterBoardRegNo: society.waterBoardRegNo,
      isActive: society.isActive,
      billingDayOfMonth: society.billingDayOfMonth,
      dueDays: society.dueDays
    };
  }

  private toOfficerAssignmentSummary(assignment: SocietyRoleAssignment & { user: User }): OfficerAssignmentSummary {
    return {
      id: assignment.id,
      role: assignment.role,
      isActive: assignment.isActive,
      assignedAt: assignment.assignedAt.toISOString(),
      unassignedAt: assignment.unassignedAt ? assignment.unassignedAt.toISOString() : null,
      user: {
        id: assignment.user.id,
        fullName: assignment.user.fullName,
        mobileNumber: assignment.user.mobileNumber,
        role: assignment.user.role,
        isActive: assignment.user.isActive
      }
    };
  }
}
