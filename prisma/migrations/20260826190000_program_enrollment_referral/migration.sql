-- AlterTable
ALTER TABLE "ProgramEnrollment" ADD COLUMN "referredClinicId" TEXT;

-- CreateIndex
CREATE INDEX "ProgramEnrollment_referredClinicId_idx" ON "ProgramEnrollment"("referredClinicId");

-- AddForeignKey
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_referredClinicId_fkey" FOREIGN KEY ("referredClinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
