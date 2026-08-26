-- AlterEnum
ALTER TYPE "LedgerSettlementStatus" ADD VALUE IF NOT EXISTS 'APPROVED';

-- AlterTable
ALTER TABLE "RevenueLedger" ADD COLUMN "partnerShareAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RevenueLedger" ADD COLUMN "paymentReference" TEXT;
