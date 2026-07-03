CREATE TABLE "SpecialOffer" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "badgeMm" TEXT NOT NULL,
    "badgeEn" TEXT,
    "titleMm" TEXT NOT NULL,
    "titleEn" TEXT,
    "descMm" TEXT,
    "descEn" TEXT,
    "ctaMm" TEXT NOT NULL,
    "ctaEn" TEXT,
    "ctaLink" TEXT,
    "ctaColor" TEXT NOT NULL DEFAULT '#0d2b6e',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialOffer_pkey" PRIMARY KEY ("id")
);
