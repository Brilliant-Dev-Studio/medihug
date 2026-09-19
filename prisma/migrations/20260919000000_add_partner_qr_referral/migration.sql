-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN "referralQrCode" TEXT;

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN "partnerQrDiscountPercent" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "PartnerQrRedemption" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerQrRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_referralQrCode_key" ON "Clinic"("referralQrCode");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerQrRedemption_appointmentId_key" ON "PartnerQrRedemption"("appointmentId");

-- CreateIndex
CREATE INDEX "PartnerQrRedemption_clinicId_idx" ON "PartnerQrRedemption"("clinicId");

-- CreateIndex
CREATE INDEX "PartnerQrRedemption_userId_idx" ON "PartnerQrRedemption"("userId");

-- CreateIndex
CREATE INDEX "PartnerQrRedemption_doctorId_idx" ON "PartnerQrRedemption"("doctorId");

-- CreateIndex
CREATE INDEX "PartnerQrRedemption_createdAt_idx" ON "PartnerQrRedemption"("createdAt");

-- AddForeignKey
ALTER TABLE "PartnerQrRedemption" ADD CONSTRAINT "PartnerQrRedemption_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerQrRedemption" ADD CONSTRAINT "PartnerQrRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerQrRedemption" ADD CONSTRAINT "PartnerQrRedemption_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerQrRedemption" ADD CONSTRAINT "PartnerQrRedemption_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
