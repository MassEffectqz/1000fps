-- AlterTable
ALTER TABLE "Order" DROP COLUMN "bonusUsed";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bonusPoints";

-- CreateIndex
CREATE UNIQUE INDEX "Review_productId_userId_key" ON "Review"("productId", "userId");
