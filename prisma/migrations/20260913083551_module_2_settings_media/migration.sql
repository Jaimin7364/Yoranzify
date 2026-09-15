-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` ENUM('LOGO', 'FAVICON', 'PRODUCT', 'CATEGORY', 'BANNER', 'REVIEW') NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `storageKey` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `checksum` CHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaAsset_storageKey_key`(`storageKey`),
    INDEX `MediaAsset_kind_createdAt_idx`(`kind`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSetting` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `storeName` VARCHAR(100) NOT NULL DEFAULT 'Yoranzify',
    `contactNumber` VARCHAR(20) NULL,
    `whatsappNumber` VARCHAR(20) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `instagramUrl` VARCHAR(500) NULL,
    `facebookUrl` VARCHAR(500) NULL,
    `gstNumber` VARCHAR(20) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `shippingChargePaise` INTEGER NOT NULL DEFAULT 9900,
    `freeShippingAbovePaise` INTEGER NOT NULL DEFAULT 199900,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 5,
    `codEnabled` BOOLEAN NOT NULL DEFAULT true,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `logoMediaId` INTEGER NULL,
    `faviconMediaId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SiteSetting` ADD CONSTRAINT `SiteSetting_logoMediaId_fkey` FOREIGN KEY (`logoMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteSetting` ADD CONSTRAINT `SiteSetting_faviconMediaId_fkey` FOREIGN KEY (`faviconMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
