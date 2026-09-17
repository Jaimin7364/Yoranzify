CREATE TABLE `Supplier` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(160) NOT NULL,
  `legalName` VARCHAR(180) NULL,
  `gstNumber` VARCHAR(20) NULL,
  `contactName` VARCHAR(100) NULL,
  `contactNumber` VARCHAR(20) NULL,
  `email` VARCHAR(191) NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postalCode` VARCHAR(12) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Supplier_isActive_name_idx`(`isActive`, `name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Product` ADD COLUMN `supplierId` INTEGER NULL;
CREATE INDEX `Product_supplierId_idx` ON `Product`(`supplierId`);
ALTER TABLE `Product` ADD CONSTRAINT `Product_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
  ADD COLUMN `gstPercent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `hsnCode` VARCHAR(20) NULL,
  ADD COLUMN `supplierIdSnapshot` INTEGER NULL,
  ADD COLUMN `supplierName` VARCHAR(180) NULL,
  ADD COLUMN `supplierGstNumber` VARCHAR(20) NULL,
  ADD COLUMN `supplierContactName` VARCHAR(100) NULL,
  ADD COLUMN `supplierContactNumber` VARCHAR(20) NULL,
  ADD COLUMN `supplierEmail` VARCHAR(191) NULL,
  ADD COLUMN `supplierAddress` TEXT NULL,
  ADD COLUMN `supplierCity` VARCHAR(100) NULL,
  ADD COLUMN `supplierState` VARCHAR(100) NULL,
  ADD COLUMN `supplierPostalCode` VARCHAR(12) NULL;
