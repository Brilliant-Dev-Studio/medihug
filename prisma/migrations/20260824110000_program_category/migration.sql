CREATE TABLE "ProgramCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProgramCategory_name_key" ON "ProgramCategory"("name");

ALTER TABLE "HealthcareProgram" ADD COLUMN "categoryId" TEXT;

CREATE INDEX "HealthcareProgram_categoryId_idx" ON "HealthcareProgram"("categoryId");

ALTER TABLE "HealthcareProgram" ADD CONSTRAINT "HealthcareProgram_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProgramCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
