-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'secratary', 'president', 'meter_reader');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'meter_reader';
