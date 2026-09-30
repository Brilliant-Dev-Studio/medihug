-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN "specialties" TEXT[],
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "availabilityNote" TEXT;

-- CreateEnum
CREATE TYPE "MedicalRequestStatus" AS ENUM ('NEW', 'SENT', 'RESPONDED', 'QUOTATION', 'ACCEPTED', 'APPOINTMENT', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MedicalRequest" (
    "id" TEXT NOT NULL,
    "ownerClinicId" TEXT NOT NULL,
    "hospitalClinicId" TEXT NOT NULL,
    "patientUserId" TEXT,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "patientEmail" TEXT,
    "specialty" TEXT,
    "reason" TEXT,
    "status" "MedicalRequestStatus" NOT NULL DEFAULT 'NEW',
    "quotationAmount" INTEGER,
    "quotationCurrency" TEXT DEFAULT 'USD',
    "quotationNote" TEXT,
    "appointmentDate" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalRequest_ownerClinicId_status_idx" ON "MedicalRequest"("ownerClinicId", "status");

-- CreateIndex
CREATE INDEX "MedicalRequest_hospitalClinicId_idx" ON "MedicalRequest"("hospitalClinicId");

-- CreateIndex
CREATE INDEX "MedicalRequest_patientUserId_idx" ON "MedicalRequest"("patientUserId");

-- AddForeignKey
ALTER TABLE "MedicalRequest" ADD CONSTRAINT "MedicalRequest_ownerClinicId_fkey" FOREIGN KEY ("ownerClinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRequest" ADD CONSTRAINT "MedicalRequest_hospitalClinicId_fkey" FOREIGN KEY ("hospitalClinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRequest" ADD CONSTRAINT "MedicalRequest_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
