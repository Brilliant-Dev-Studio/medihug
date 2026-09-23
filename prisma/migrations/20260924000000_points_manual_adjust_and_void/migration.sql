-- AlterEnum
ALTER TYPE "PointsTransactionType" ADD VALUE 'ADJUSTED';

-- AlterTable
ALTER TABLE "PointsLedger"
  ALTER COLUMN "sourceType" DROP NOT NULL,
  ALTER COLUMN "sourceId" DROP NOT NULL,
  ADD COLUMN "rateKs" INTEGER,
  ADD COLUMN "note" TEXT,
  ADD COLUMN "createdByAdminId" TEXT,
  ADD COLUMN "createdByAdminName" TEXT,
  ADD COLUMN "editedAt" TIMESTAMP(3),
  ADD COLUMN "editedByAdminName" TEXT,
  ADD COLUMN "voidedAt" TIMESTAMP(3),
  ADD COLUMN "voidedByAdminName" TEXT,
  ADD COLUMN "voidReason" TEXT;

-- CreateIndex
CREATE INDEX "PointsLedger_createdAt_idx" ON "PointsLedger"("createdAt");
