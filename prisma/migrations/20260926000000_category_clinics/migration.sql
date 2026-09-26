-- CreateTable
CREATE TABLE "CategoryClinic" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryClinic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryClinic_clinicId_idx" ON "CategoryClinic"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryClinic_categoryId_clinicId_key" ON "CategoryClinic"("categoryId", "clinicId");

-- AddForeignKey
ALTER TABLE "CategoryClinic" ADD CONSTRAINT "CategoryClinic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryClinic" ADD CONSTRAINT "CategoryClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
