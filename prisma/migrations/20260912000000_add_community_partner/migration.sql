-- CreateTable
CREATE TABLE "CommunityPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "descriptionMm" TEXT,
    "descriptionEn" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "viber" TEXT,
    "location" TEXT,
    "address" TEXT,
    "addressEn" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPartner_pkey" PRIMARY KEY ("id")
);
