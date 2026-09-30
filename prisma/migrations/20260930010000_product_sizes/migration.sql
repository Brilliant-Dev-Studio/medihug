-- CreateTable
CREATE TABLE "ProductSize" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceOverride" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSize_productId_idx" ON "ProductSize"("productId");

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "sizeId" TEXT,
ADD COLUMN "sizeLabel" TEXT;

-- CreateIndex
CREATE INDEX "OrderItem_sizeId_idx" ON "OrderItem"("sizeId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "ProductSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;
