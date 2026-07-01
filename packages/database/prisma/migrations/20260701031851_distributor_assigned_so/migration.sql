-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "assignedSalesOfficerId" TEXT;

-- AddForeignKey
ALTER TABLE "Distributor" ADD CONSTRAINT "Distributor_assignedSalesOfficerId_fkey" FOREIGN KEY ("assignedSalesOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
