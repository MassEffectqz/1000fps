-- Add warehouseId to unique constraint for CartItem
-- This allows the same product from different warehouses to be separate cart items

ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_productId_key";

ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_productId_warehouseId_key" UNIQUE ("cartId", "productId", "warehouseId");