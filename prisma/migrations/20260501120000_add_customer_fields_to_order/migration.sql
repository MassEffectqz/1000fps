-- AddCustomerFieldsToOrder
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;