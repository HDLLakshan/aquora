/*
  Safely migrates user/auth schema without requiring manual table drops.
  - Preserves existing user.name by backfilling into fullName before dropping.
  - Maps old Role enum values to new uppercase values.
*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'SI', 'TA');

-- AlterEnum (Role)
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'METER_READER');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "Role"
  USING (
    CASE "role"::text
      WHEN 'super_admin' THEN 'SUPER_ADMIN'
      WHEN 'secratary' THEN 'SECRETARY'
      WHEN 'president' THEN 'PRESIDENT'
      WHEN 'meter_reader' THEN 'METER_READER'
      WHEN 'SUPER_ADMIN' THEN 'SUPER_ADMIN'
      WHEN 'SECRETARY' THEN 'SECRETARY'
      WHEN 'PRESIDENT' THEN 'PRESIDENT'
      WHEN 'TREASURER' THEN 'TREASURER'
      WHEN 'METER_READER' THEN 'METER_READER'
      ELSE 'METER_READER'
    END
  )::"Role";

DROP TYPE "Role_old";

-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable (users)
ALTER TABLE "users"
  ADD COLUMN "createdBy" TEXT,
  ADD COLUMN "fullName" TEXT,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
  ADD COLUMN "societyId" TEXT,
  ADD COLUMN "updatedBy" TEXT,
  ALTER COLUMN "id" DROP DEFAULT;

UPDATE "users" SET "fullName" = "name" WHERE "fullName" IS NULL;
ALTER TABLE "users" ALTER COLUMN "fullName" SET NOT NULL;
ALTER TABLE "users" DROP COLUMN "name";

-- CreateTable
CREATE TABLE "Society" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Society_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocietyRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocietyRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteMeterReader" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteMeterReader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterReading" (
    "id" TEXT NOT NULL,
    "capturedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeterReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "collectedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocietyRoleAssignment_userId_idx" ON "SocietyRoleAssignment"("userId");

-- CreateIndex
CREATE INDEX "SocietyRoleAssignment_societyId_idx" ON "SocietyRoleAssignment"("societyId");

-- CreateIndex
CREATE UNIQUE INDEX "SocietyRoleAssignment_userId_societyId_role_key" ON "SocietyRoleAssignment"("userId", "societyId", "role");

-- CreateIndex
CREATE INDEX "RouteMeterReader_userId_idx" ON "RouteMeterReader"("userId");

-- CreateIndex
CREATE INDEX "MeterReading_capturedById_idx" ON "MeterReading"("capturedById");

-- CreateIndex
CREATE INDEX "Payment_collectedById_idx" ON "Payment"("collectedById");

-- CreateIndex
CREATE INDEX "users_societyId_idx" ON "users"("societyId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietyRoleAssignment" ADD CONSTRAINT "SocietyRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietyRoleAssignment" ADD CONSTRAINT "SocietyRoleAssignment_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteMeterReader" ADD CONSTRAINT "RouteMeterReader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_capturedById_fkey" FOREIGN KEY ("capturedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
