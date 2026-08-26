CREATE TABLE "DoctorCategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DoctorCategory_categoryId_doctorId_key" ON "DoctorCategory"("categoryId", "doctorId");

ALTER TABLE "DoctorCategory" ADD CONSTRAINT "DoctorCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DoctorCategory" ADD CONSTRAINT "DoctorCategory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
