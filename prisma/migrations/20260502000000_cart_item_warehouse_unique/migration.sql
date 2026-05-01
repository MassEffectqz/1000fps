-- Add warehouseId to unique constraint for CartItem
-- This allows the same product from different warehouses to be separate cart items

-- Try to find and drop existing unique constraint on (cartId, productId)
DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'CartItem'::regclass 
        AND contype = 'u'
        AND (SELECT count(*) FROM pg_attribute WHERE attrelid = 'CartItem'::regclass AND attnum = ANY(conkey)) = 2
    LOOP
        EXECUTE format('ALTER TABLE "CartItem" DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END $$;

-- Add new unique constraint including warehouseId
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_productId_warehouseId_key" UNIQUE ("cartId", "productId", "warehouseId");