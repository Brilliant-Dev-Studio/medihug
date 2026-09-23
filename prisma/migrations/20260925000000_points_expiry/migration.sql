-- CreateEnum
CREATE TYPE "PointsExpiryUnit" AS ENUM ('DAYS', 'MONTHS');

-- AlterTable
ALTER TABLE "PointsSettings"
  ADD COLUMN "expiryEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "expiryValue" INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN "expiryUnit" "PointsExpiryUnit" NOT NULL DEFAULT 'MONTHS';

-- AlterTable
ALTER TABLE "PointsLedger" ADD COLUMN "noExpiry" BOOLEAN NOT NULL DEFAULT false;
