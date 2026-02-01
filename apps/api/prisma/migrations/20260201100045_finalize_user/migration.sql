/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MeterReading` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RouteMeterReader` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `SocietyRoleAssignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId,billingPeriodId]` on the table `MeterReading` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[routeId,userId,isActive]` on the table `RouteMeterReader` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[waterBoardRegNo]` on the table `Society` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `billingPeriodId` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readingAt` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readingValue` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `MeterReading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeId` to the `RouteMeterReader` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `RouteMeterReader` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingSchemeJson` to the `Society` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waterBoardRegNo` to the `Society` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillDeliveryMethod" AS ENUM ('SMS', 'EMAIL', 'PRINTED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'DISCONNECTED', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "MeterReading" DROP CONSTRAINT "MeterReading_capturedById_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_collectedById_fkey";

-- DropForeignKey
ALTER TABLE "RouteMeterReader" DROP CONSTRAINT "RouteMeterReader_userId_fkey";

-- DropForeignKey
ALTER TABLE "SocietyRoleAssignment" DROP CONSTRAINT "SocietyRoleAssignment_societyId_fkey";

-- DropForeignKey
ALTER TABLE "SocietyRoleAssignment" DROP CONSTRAINT "SocietyRoleAssignment_userId_fkey";

-- DropIndex
DROP INDEX "MeterReading_capturedById_idx";

-- DropIndex
DROP INDEX "Payment_collectedById_idx";

-- DropIndex
DROP INDEX "RouteMeterReader_userId_idx";

-- DropIndex
DROP INDEX "SocietyRoleAssignment_societyId_idx";

-- DropIndex
DROP INDEX "SocietyRoleAssignment_userId_idx";

-- DropIndex
DROP INDEX "SocietyRoleAssignment_userId_societyId_role_key";

-- AlterTable
ALTER TABLE "MeterReading" DROP COLUMN "createdAt",
ADD COLUMN     "billingPeriodId" TEXT NOT NULL,
ADD COLUMN     "capturedOffline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "meterId" TEXT,
ADD COLUMN     "readingAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "readingValue" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "societyId" TEXT NOT NULL,
ADD COLUMN     "syncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "createdAt",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "balanceAfter" DECIMAL(65,30),
ADD COLUMN     "balanceBefore" DECIMAL(65,30),
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiptNo" TEXT,
ADD COLUMN     "societyId" TEXT NOT NULL,
ADD COLUMN     "waterBillId" TEXT;

-- AlterTable
ALTER TABLE "RouteMeterReader" DROP COLUMN "createdAt",
ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "routeId" TEXT NOT NULL,
ADD COLUMN     "societyId" TEXT NOT NULL,
ADD COLUMN     "unassignedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "address" TEXT,
ADD COLUMN     "billingDayOfMonth" INTEGER,
ADD COLUMN     "billingSchemeJson" JSONB NOT NULL,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "dueDays" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "waterBoardRegNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SocietyRoleAssignment" DROP COLUMN "createdAt",
ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "unassignedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "accountNo" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNumber" TEXT,
    "address" TEXT,
    "email" TEXT,
    "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
    "billDeliveryMethod" "BillDeliveryMethod" NOT NULL DEFAULT 'SMS',
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "openingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meter" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "serialNo" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerMeter" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlinkedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerMeter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPeriod" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "BillingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterBill" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "billingPeriodId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "meterReadingId" TEXT NOT NULL,
    "billNo" TEXT NOT NULL,
    "previousBalance" DECIMAL(65,30) NOT NULL,
    "consumptionUnits" DECIMAL(65,30) NOT NULL,
    "currentCharge" DECIMAL(65,30) NOT NULL,
    "totalDue" DECIMAL(65,30) NOT NULL,
    "calculationBreakdownJson" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedById" TEXT,

    CONSTRAINT "WaterBill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Route_societyId_idx" ON "Route"("societyId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_societyId_name_key" ON "Route"("societyId", "name");

-- CreateIndex
CREATE INDEX "Customer_societyId_routeId_idx" ON "Customer"("societyId", "routeId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_societyId_accountNo_key" ON "Customer"("societyId", "accountNo");

-- CreateIndex
CREATE UNIQUE INDEX "Meter_societyId_serialNo_key" ON "Meter"("societyId", "serialNo");

-- CreateIndex
CREATE INDEX "CustomerMeter_societyId_customerId_isActive_idx" ON "CustomerMeter"("societyId", "customerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPeriod_societyId_periodYear_periodMonth_key" ON "BillingPeriod"("societyId", "periodYear", "periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "WaterBill_meterReadingId_key" ON "WaterBill"("meterReadingId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterBill_customerId_billingPeriodId_key" ON "WaterBill"("customerId", "billingPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterBill_societyId_billNo_key" ON "WaterBill"("societyId", "billNo");

-- CreateIndex
CREATE INDEX "MeterReading_societyId_billingPeriodId_idx" ON "MeterReading"("societyId", "billingPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "MeterReading_customerId_billingPeriodId_key" ON "MeterReading"("customerId", "billingPeriodId");

-- CreateIndex
CREATE INDEX "Payment_societyId_customerId_idx" ON "Payment"("societyId", "customerId");

-- CreateIndex
CREATE INDEX "RouteMeterReader_societyId_idx" ON "RouteMeterReader"("societyId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteMeterReader_routeId_userId_isActive_key" ON "RouteMeterReader"("routeId", "userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Society_waterBoardRegNo_key" ON "Society"("waterBoardRegNo");

-- CreateIndex
CREATE INDEX "SocietyRoleAssignment_societyId_role_isActive_idx" ON "SocietyRoleAssignment"("societyId", "role", "isActive");

-- AddForeignKey
ALTER TABLE "SocietyRoleAssignment" ADD CONSTRAINT "SocietyRoleAssignment_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietyRoleAssignment" ADD CONSTRAINT "SocietyRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteMeterReader" ADD CONSTRAINT "RouteMeterReader_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteMeterReader" ADD CONSTRAINT "RouteMeterReader_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteMeterReader" ADD CONSTRAINT "RouteMeterReader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meter" ADD CONSTRAINT "Meter_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMeter" ADD CONSTRAINT "CustomerMeter_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMeter" ADD CONSTRAINT "CustomerMeter_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "Meter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMeter" ADD CONSTRAINT "CustomerMeter_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPeriod" ADD CONSTRAINT "BillingPeriod_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_billingPeriodId_fkey" FOREIGN KEY ("billingPeriodId") REFERENCES "BillingPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_capturedById_fkey" FOREIGN KEY ("capturedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterBill" ADD CONSTRAINT "WaterBill_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterBill" ADD CONSTRAINT "WaterBill_billingPeriodId_fkey" FOREIGN KEY ("billingPeriodId") REFERENCES "BillingPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterBill" ADD CONSTRAINT "WaterBill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterBill" ADD CONSTRAINT "WaterBill_meterReadingId_fkey" FOREIGN KEY ("meterReadingId") REFERENCES "MeterReading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_waterBillId_fkey" FOREIGN KEY ("waterBillId") REFERENCES "WaterBill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
