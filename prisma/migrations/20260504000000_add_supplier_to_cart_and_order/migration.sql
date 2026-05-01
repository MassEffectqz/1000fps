-- Add supplierId to CartItem and Order, update unique constraint
BEGIN;

-- Add supplierId column to CartItem
ALTER TABLE "CartItem" ADD COLUMN "supplierId" TEXT;

-- Drop old unique constraint
ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_cartId_productId_key";

-- Add new unique constraint with warehouseId and supplierId
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_productId_warehouseId_supplierId_key" UNIQUE ("cartId", "productId", "warehouseId", "supplierId");

-- Add supplierId column to Order
ALTER TABLE "Order" ADD COLUMN "supplierId" TEXT;

COMMIT;