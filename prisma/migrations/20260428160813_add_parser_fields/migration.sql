-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "parserDelivery" TEXT,
ADD COLUMN     "parserInStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parserName" TEXT,
ADD COLUMN     "parserOldPrice" DECIMAL(10,2),
ADD COLUMN     "parserPrice" DECIMAL(10,2),
ADD COLUMN     "parserSources" JSONB,
ADD COLUMN     "parserUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "useParserPrice" BOOLEAN NOT NULL DEFAULT false;
