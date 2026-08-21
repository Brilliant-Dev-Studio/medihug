-- CreateEnum
CREATE TYPE "ProgramEnrollmentStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "HealthcareProgram" ADD COLUMN "price" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProgramDoctor" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramDoctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramEnrollment" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "receiptUrl" TEXT,
    "cbPayStatus" "CbPayStatus" NOT NULL DEFAULT 'NONE',
    "cbPayRefOrder" TEXT,
    "cbPayTransactionId" TEXT,
    "cbPayAmountConfirmed" INTEGER,
    "cbPayPaidAt" TIMESTAMP(3),
    "amount" INTEGER NOT NULL,
    "intake" JSONB,
    "status" "ProgramEnrollmentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramDoctor_programId_doctorId_key" ON "ProgramDoctor"("programId", "doctorId");

-- CreateIndex
CREATE INDEX "ProgramDoctor_doctorId_idx" ON "ProgramDoctor"("doctorId");

-- CreateIndex
CREATE INDEX "ProgramEnrollment_programId_idx" ON "ProgramEnrollment"("programId");

-- CreateIndex
CREATE INDEX "ProgramEnrollment_userId_idx" ON "ProgramEnrollment"("userId");

-- CreateIndex
CREATE INDEX "ProgramEnrollment_cbPayRefOrder_idx" ON "ProgramEnrollment"("cbPayRefOrder");

-- AddForeignKey
ALTER TABLE "ProgramDoctor" ADD CONSTRAINT "ProgramDoctor_programId_fkey" FOREIGN KEY ("programId") REFERENCES "HealthcareProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDoctor" ADD CONSTRAINT "ProgramDoctor_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "HealthcareProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
