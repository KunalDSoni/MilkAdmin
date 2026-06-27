-- CreateTable
CREATE TABLE "SalesVisit" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayStartAt" TIMESTAMP(3),
    "salesOfficerId" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "routeName" TEXT,
    "outletType" "OutletType" NOT NULL DEFAULT 'EXISTING',
    "inTime" TIMESTAMP(3),
    "bookingTime" TIMESTAMP(3),
    "competition" TEXT,
    "remarks" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesVisitItem" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "SalesVisitItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesVisit_orderId_key" ON "SalesVisit"("orderId");

-- CreateIndex
CREATE INDEX "SalesVisit_distributorId_date_idx" ON "SalesVisit"("distributorId", "date");

-- CreateIndex
CREATE INDEX "SalesVisit_salesOfficerId_date_idx" ON "SalesVisit"("salesOfficerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SalesVisitItem_visitId_productId_key" ON "SalesVisitItem"("visitId", "productId");

-- AddForeignKey
ALTER TABLE "SalesVisit" ADD CONSTRAINT "SalesVisit_salesOfficerId_fkey" FOREIGN KEY ("salesOfficerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesVisit" ADD CONSTRAINT "SalesVisit_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesVisit" ADD CONSTRAINT "SalesVisit_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesVisit" ADD CONSTRAINT "SalesVisit_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesVisitItem" ADD CONSTRAINT "SalesVisitItem_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "SalesVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesVisitItem" ADD CONSTRAINT "SalesVisitItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
