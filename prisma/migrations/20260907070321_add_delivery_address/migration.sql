-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveryAddress" TEXT;

-- AlterTable
ALTER TABLE "ProgramEnrollment" ADD COLUMN "deliveryAddress" TEXT;
