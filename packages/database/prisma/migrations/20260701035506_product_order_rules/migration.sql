-- CreateEnum
CREATE TYPE "OrderUnit" AS ENUM ('CRATE', 'UNIT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "maxOrderQty" DECIMAL(12,3),
ADD COLUMN     "minOrderQty" DECIMAL(12,3),
ADD COLUMN     "orderUnit" "OrderUnit" NOT NULL DEFAULT 'UNIT',
ADD COLUMN     "unitPrice" DECIMAL(12,2);
