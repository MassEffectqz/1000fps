-- Add warehouseId to unique constraint for CartItem
-- This allows the same product from different warehouses to be separate cart items

-- Drop existing unique constraint if exists
DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = '"CartItem"'::regclass 
        AND contype = 'u'
    LOOP
        EXECUTE format('ALTER TABLE "CartItem" DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END $$;

-- Add new unique constraint including warehouseId
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_productId_warehouseId_key" UNIQUE ("cartId", "productId", "warehouseId");