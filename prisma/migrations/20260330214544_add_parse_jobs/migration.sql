-- CreateEnum
CREATE TYPE "ParseJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ParseJob" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "sources" TEXT[],
    "status" "ParseJobStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "jobId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ParseJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParseJob_productId_idx" ON "ParseJob"("productId");

-- CreateIndex
CREATE INDEX "ParseJob_status_idx" ON "ParseJob"("status");

-- CreateIndex
CREATE INDEX "ParseJob_createdAt_idx" ON "ParseJob"("createdAt");
