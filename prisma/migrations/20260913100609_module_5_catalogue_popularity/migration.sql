-- AlterTable
ALTER TABLE `Product` ADD COLUMN `deliveredSalesCount` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Product_status_deliveredSalesCount_createdAt_idx` ON `Product`(`status`, `deliveredSalesCount`, `createdAt`);
