-- CreateEnum
CREATE TYPE "PointsTransactionType" AS ENUM ('EARNED', 'REDEEMED');

-- CreateTable
CREATE TABLE "PointsSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "kyatPerPointEarn" INTEGER NOT NULL DEFAULT 1000,
    "kyatPerPointRedeem" INTEGER NOT NULL DEFAULT 1000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PointsTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "sourceType" "RevenueSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "amountKs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PointsLedger_sourceType_sourceId_type_key" ON "PointsLedger"("sourceType", "sourceId", "type");

-- CreateIndex
CREATE INDEX "PointsLedger_userId_idx" ON "PointsLedger"("userId");

-- CreateIndex
CREATE INDEX "PointsLedger_userId_createdAt_idx" ON "PointsLedger"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "PointsLedger" ADD CONSTRAINT "PointsLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "pointsRedeemed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "pointsDiscountAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "pointsRedeemed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Appointment" ADD COLUMN "pointsDiscountAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProgramEnrollment" ADD COLUMN "pointsRedeemed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProgramEnrollment" ADD COLUMN "pointsDiscountAmount" INTEGER NOT NULL DEFAULT 0;
