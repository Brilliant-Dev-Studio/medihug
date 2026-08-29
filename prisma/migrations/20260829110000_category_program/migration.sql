-- CreateTable
CREATE TABLE "CategoryProgram" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryProgram_categoryId_programId_key" ON "CategoryProgram"("categoryId", "programId");

-- AddForeignKey
ALTER TABLE "CategoryProgram" ADD CONSTRAINT "CategoryProgram_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryProgram" ADD CONSTRAINT "CategoryProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "HealthcareProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
