CREATE TYPE "RevenueSourceType" AS ENUM ('CONSULTATION', 'PROGRAM', 'PRODUCT', 'HOME_SERVICE', 'PARTNER_SERVICE');
CREATE TYPE "RevenueOwnershipType" AS ENUM ('MEDIHUG', 'PARTNER', 'SHARED');
CREATE TYPE "LedgerSettlementStatus" AS ENUM ('PENDING', 'SETTLED', 'HELD');

CREATE TABLE "RevenueLedger" (
    "id" TEXT NOT NULL,
    "sourceType" "RevenueSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "patientPaid" INTEGER NOT NULL,
    "ownershipType" "RevenueOwnershipType" NOT NULL,
    "clinicId" TEXT,
    "medihugSharePercent" INTEGER NOT NULL,
    "medihugShareAmount" INTEGER NOT NULL,
    "referralClinicId" TEXT,
    "partnerReferralFeePercent" INTEGER NOT NULL DEFAULT 0,
    "partnerReferralFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "netMedihugRevenue" INTEGER NOT NULL,
    "settlementStatus" "LedgerSettlementStatus" NOT NULL DEFAULT 'PENDING',
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RevenueLedger_sourceType_sourceId_key" ON "RevenueLedger"("sourceType", "sourceId");
CREATE INDEX "RevenueLedger_clinicId_idx" ON "RevenueLedger"("clinicId");
CREATE INDEX "RevenueLedger_ownershipType_idx" ON "RevenueLedger"("ownershipType");
CREATE INDEX "RevenueLedger_settlementStatus_idx" ON "RevenueLedger"("settlementStatus");

ALTER TABLE "RevenueLedger" ADD CONSTRAINT "RevenueLedger_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RevenueLedger" ADD CONSTRAINT "RevenueLedger_referralClinicId_fkey" FOREIGN KEY ("referralClinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
