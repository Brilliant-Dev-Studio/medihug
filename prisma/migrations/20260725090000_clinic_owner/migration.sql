ALTER TABLE "Clinic" ADD COLUMN "ownerId" TEXT;
CREATE UNIQUE INDEX "Clinic_ownerId_key" ON "Clinic"("ownerId");
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
