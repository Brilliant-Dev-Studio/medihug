-- CreateEnum
CREATE TYPE "HealthLogType" AS ENUM ('WEIGHT', 'WAIST', 'BLOOD_PRESSURE', 'BLOOD_SUGAR', 'MEAL', 'EXERCISE', 'WATER', 'SLEEP', 'STEPS', 'MEDICATION');

-- CreateTable
CREATE TABLE "HealthLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "HealthLogType" NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthLog_userId_type_loggedAt_idx" ON "HealthLog"("userId", "type", "loggedAt");

-- AddForeignKey
ALTER TABLE "HealthLog" ADD CONSTRAINT "HealthLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
