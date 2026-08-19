-- CreateEnum
CREATE TYPE "CbPayStatus" AS ENUM ('NONE', 'INITIATED', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Appointment"
  ADD COLUMN "cbPayStatus" "CbPayStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "cbPayRefOrder" TEXT,
  ADD COLUMN "cbPayTransactionId" TEXT,
  ADD COLUMN "cbPayAmountConfirmed" INTEGER,
  ADD COLUMN "cbPayPaidAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "cbPayStatus" "CbPayStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "cbPayRefOrder" TEXT,
  ADD COLUMN "cbPayTransactionId" TEXT,
  ADD COLUMN "cbPayAmountConfirmed" INTEGER,
  ADD COLUMN "cbPayPaidAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Appointment_cbPayRefOrder_idx" ON "Appointment"("cbPayRefOrder");

-- CreateIndex
CREATE INDEX "Order_cbPayRefOrder_idx" ON "Order"("cbPayRefOrder");
