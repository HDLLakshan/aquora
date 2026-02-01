import assert from "node:assert/strict";
import test from "node:test";
import type { Role, Society, SocietyRoleAssignment, User } from "@prisma/client";

import { SocietiesService } from "./societies.service";
import type { SocietiesRepository } from "./societies.repository";

class FakeSocietiesRepository {
  societies = new Map<string, Society>();
  users = new Map<string, User>();
  assignments: SocietyRoleAssignment[] = [];

  async findSocietyById(id: string) {
    return this.societies.get(id) ?? null;
  }

  async findUserById(id: string) {
    return this.users.get(id) ?? null;
  }

  async updateUserSociety(id: string, societyId: string) {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated: User = { ...user, societyId, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async deactivateActiveAssignments(societyId: string, role: Role) {
    this.assignments = this.assignments.map((assignment) => {
      if (assignment.societyId === societyId && assignment.role === role && assignment.isActive) {
        return { ...assignment, isActive: false, unassignedAt: new Date() };
      }
      return assignment;
    });
  }

  async createAssignment(data: {
    societyId?: string;
    userId?: string;
    role: Role;
    isActive?: boolean;
    assignedAt: Date;
    society?: { connect?: { id: string } };
    user?: { connect?: { id: string } };
  }) {
    const societyId = data.societyId ?? data.society?.connect?.id;
    const userId = data.userId ?? data.user?.connect?.id;
    if (!societyId || !userId) {
      throw new Error("Missing societyId or userId");
    }

    const assignment: SocietyRoleAssignment = {
      id: `assignment-${this.assignments.length + 1}`,
      societyId,
      userId,
      role: data.role,
      isActive: data.isActive ?? true,
      assignedAt: data.assignedAt,
      unassignedAt: null
    };
    this.assignments.push(assignment);
    return assignment;
  }

  async listActiveOfficers(societyId: string) {
    return this.assignments
      .filter((assignment) =>
        assignment.societyId === societyId &&
        assignment.isActive &&
        (assignment.role === "PRESIDENT" || assignment.role === "SECRETARY")
      )
      .map((assignment) => {
        const user = this.users.get(assignment.userId);
        if (!user) throw new Error("User not found");
        return { ...assignment, user };
      });
  }
}

const runInTransaction = async <T,>(fn: (tx: any) => Promise<T>) => fn({});

function buildUser(overrides: Partial<User>): User {
  return {
    id: "user-1",
    fullName: "Test User",
    mobileNumber: "94770000000",
    passwordHash: "hash",
    role: "SECRETARY",
    preferredLanguage: "EN",
    isActive: true,
    societyId: null,
    createdAt: new Date(),
    createdBy: null,
    updatedAt: new Date(),
    updatedBy: null,
    ...overrides
  };
}

function buildSociety(overrides: Partial<Society>): Society {
  return {
    id: "society-1",
    name: "Test Society",
    address: null,
    waterBoardRegNo: "WB-001",
    isActive: true,
    billingSchemeJson: { plan: "basic" },
    billingDayOfMonth: 10,
    dueDays: 7,
    createdAt: new Date(),
    createdBy: null,
    updatedAt: new Date(),
    updatedBy: null,
    ...overrides
  };
}

test("assigning president twice deactivates the previous assignment", async () => {
  const repo = new FakeSocietiesRepository();
  const society = buildSociety({ id: "society-1" });
  repo.societies.set(society.id, society);

  const userOne = buildUser({ id: "user-1", role: "PRESIDENT", societyId: society.id });
  const userTwo = buildUser({ id: "user-2", role: "PRESIDENT", societyId: society.id, fullName: "Second" });
  repo.users.set(userOne.id, userOne);
  repo.users.set(userTwo.id, userTwo);

  repo.assignments.push({
    id: "assignment-1",
    societyId: society.id,
    userId: userOne.id,
    role: "PRESIDENT",
    isActive: true,
    assignedAt: new Date(),
    unassignedAt: null
  });

  const service = new SocietiesService(repo as unknown as SocietiesRepository, runInTransaction);
  await service.assignOfficer(society.id, { userId: userTwo.id, role: "PRESIDENT" }, { actorId: "admin-1" });

  const active = repo.assignments.filter(
    (assignment) => assignment.societyId === society.id && assignment.role === "PRESIDENT" && assignment.isActive
  );

  assert.equal(active.length, 1);
  assert.equal(active[0]?.userId, userTwo.id);
  const previous = repo.assignments.find((assignment) => assignment.userId === userOne.id && assignment.role === "PRESIDENT");
  assert.equal(previous?.isActive, false);
});
