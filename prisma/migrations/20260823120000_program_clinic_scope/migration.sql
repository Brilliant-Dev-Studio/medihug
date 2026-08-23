-- AlterTable
ALTER TABLE "HealthcareProgram" ADD COLUMN "clinicId" TEXT;

-- CreateIndex
CREATE INDEX "HealthcareProgram_clinicId_idx" ON "HealthcareProgram"("clinicId");

-- AddForeignKey
ALTER TABLE "HealthcareProgram" ADD CONSTRAINT "HealthcareProgram_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
