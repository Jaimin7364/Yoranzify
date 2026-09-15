-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `skuReference` VARCHAR(80) NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `categoryId` INTEGER NOT NULL,
    `brand` VARCHAR(100) NULL,
    `gender` ENUM('WOMEN', 'MEN', 'UNISEX', 'KIDS') NOT NULL,
    `regularPricePaise` INTEGER NOT NULL,
    `salePricePaise` INTEGER NULL,
    `gstPercent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `hsnCode` VARCHAR(20) NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'DRAFT',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isBestSeller` BOOLEAN NOT NULL DEFAULT false,
    `isNewArrival` BOOLEAN NOT NULL DEFAULT false,
    `seoTitle` VARCHAR(180) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    UNIQUE INDEX `Product_skuReference_key`(`skuReference`),
    INDEX `Product_categoryId_status_archivedAt_idx`(`categoryId`, `status`, `archivedAt`),
    INDEX `Product_gender_status_idx`(`gender`, `status`),
    INDEX `Product_isFeatured_isBestSeller_isNewArrival_idx`(`isFeatured`, `isBestSeller`, `isNewArrival`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `mediaId` INTEGER NOT NULL,
    `altText` VARCHAR(255) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ProductImage_productId_mediaId_key`(`productId`, `mediaId`),
    UNIQUE INDEX `ProductImage_productId_position_key`(`productId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `hex` CHAR(7) NOT NULL,

    UNIQUE INDEX `Color_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Size_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `colorId` INTEGER NOT NULL,
    `sizeId` INTEGER NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `priceOverridePaise` INTEGER NULL,
    `stockQuantity` INTEGER NOT NULL DEFAULT 0,
    `lowStockThreshold` INTEGER NULL,
    `weightGrams` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductVariant_sku_key`(`sku`),
    INDEX `ProductVariant_productId_isActive_idx`(`productId`, `isActive`),
    INDEX `ProductVariant_stockQuantity_idx`(`stockQuantity`),
    UNIQUE INDEX `ProductVariant_productId_colorId_sizeId_key`(`productId`, `colorId`, `sizeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryMovement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `variantId` INTEGER NOT NULL,
    `delta` INTEGER NOT NULL,
    `balance` INTEGER NOT NULL,
    `reason` ENUM('INITIAL', 'RESTOCK', 'CORRECTION', 'SALE', 'CANCELLATION', 'RETURN') NOT NULL,
    `note` VARCHAR(500) NULL,
    `actorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InventoryMovement_variantId_createdAt_idx`(`variantId`, `createdAt`),
    INDEX `InventoryMovement_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryMovement` ADD CONSTRAINT `InventoryMovement_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryMovement` ADD CONSTRAINT `InventoryMovement_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
