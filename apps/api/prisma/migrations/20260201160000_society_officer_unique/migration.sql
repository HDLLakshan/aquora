-- Enforce one active president/secretary per society.
CREATE UNIQUE INDEX IF NOT EXISTS "SocietyRoleAssignment_societyId_president_active_key"
ON "SocietyRoleAssignment" ("societyId")
WHERE "isActive" = true AND "role" = 'PRESIDENT';

CREATE UNIQUE INDEX IF NOT EXISTS "SocietyRoleAssignment_societyId_secretary_active_key"
ON "SocietyRoleAssignment" ("societyId")
WHERE "isActive" = true AND "role" = 'SECRETARY';
