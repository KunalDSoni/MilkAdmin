-- CreateEnum
CREATE TYPE "SampleTargetType" AS ENUM ('DISTRIBUTOR', 'RETAILER');

-- CreateTable
CREATE TABLE "SampleOrder" (
    "id" TEXT NOT NULL,
    "placedById" TEXT NOT NULL,
    "targetType" "SampleTargetType" NOT NULL,
    "distributorId" TEXT,
    "retailerId" TEXT,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleOrderItem" (
    "id" TEXT NOT NULL,
    "sampleOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "SampleOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SampleOrder_placedById_createdAt_idx" ON "SampleOrder"("placedById", "createdAt");

-- CreateIndex
CREATE INDEX "SampleOrder_targetType_createdAt_idx" ON "SampleOrder"("targetType", "createdAt");

-- CreateIndex
CREATE INDEX "SampleOrderItem_sampleOrderId_idx" ON "SampleOrderItem"("sampleOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleOrderItem_sampleOrderId_productId_key" ON "SampleOrderItem"("sampleOrderId", "productId");

-- AddForeignKey
ALTER TABLE "SampleOrder" ADD CONSTRAINT "SampleOrder_placedById_fkey" FOREIGN KEY ("placedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleOrder" ADD CONSTRAINT "SampleOrder_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleOrder" ADD CONSTRAINT "SampleOrder_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleOrderItem" ADD CONSTRAINT "SampleOrderItem_sampleOrderId_fkey" FOREIGN KEY ("sampleOrderId") REFERENCES "SampleOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleOrderItem" ADD CONSTRAINT "SampleOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
