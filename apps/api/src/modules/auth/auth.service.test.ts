import assert from "node:assert/strict";
import test from "node:test";
import type { SocietyRoleAssignment, User } from "@prisma/client";

import { AuthService } from "./auth.service";
import type { AuthRepository } from "./auth.repository";

const buildUser = (overrides: Partial<User>): User => ({
  id: "user-1",
  fullName: "Test User",
  mobileNumber: "94770000000",
  passwordHash: "hash",
  role: "TREASURER",
  preferredLanguage: "EN",
  isActive: true,
  societyId: "society-1",
  createdAt: new Date(),
  createdBy: null,
  updatedAt: new Date(),
  updatedBy: null,
  ...overrides
});

test("login context uses active president assignment", async () => {
  const assignment: SocietyRoleAssignment = {
    id: "assignment-1",
    societyId: "society-99",
    userId: "user-1",
    role: "PRESIDENT",
    isActive: true,
    assignedAt: new Date(),
    unassignedAt: null
  };

  const repo = {
    findActiveSocietyRoleAssignment: async () => assignment
  } as unknown as AuthRepository;

  const service = new AuthService(repo);
  const context = await service.resolveAuthContext(buildUser({ id: "user-1" }));

  assert.equal(context.effectiveRole, "PRESIDENT");
  assert.equal(context.societyId, "society-99");
});
