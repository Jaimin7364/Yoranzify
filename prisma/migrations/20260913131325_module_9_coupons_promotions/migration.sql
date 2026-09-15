-- AlterTable
ALTER TABLE `Cart` ADD COLUMN `couponId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(40) NOT NULL,
    `description` VARCHAR(255) NULL,
    `discountType` ENUM('PERCENTAGE', 'FLAT') NOT NULL,
    `discountValue` INTEGER NOT NULL,
    `minimumSpendPaise` INTEGER NOT NULL DEFAULT 0,
    `maximumDiscountPaise` INTEGER NULL,
    `firstOrderOnly` BOOLEAN NOT NULL DEFAULT false,
    `usageLimit` INTEGER NULL,
    `perUserLimit` INTEGER NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Coupon_code_key`(`code`),
    INDEX `Coupon_enabled_startsAt_endsAt_idx`(`enabled`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponCustomer` (
    `couponId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `CouponCustomer_userId_idx`(`userId`),
    PRIMARY KEY (`couponId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponUsage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `couponId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` ENUM('RESERVED', 'REDEEMED', 'RELEASED') NOT NULL DEFAULT 'RESERVED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CouponUsage_couponId_status_idx`(`couponId`, `status`),
    INDEX `CouponUsage_couponId_userId_status_idx`(`couponId`, `userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Promotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(255) NULL,
    `discountType` ENUM('PERCENTAGE', 'FLAT') NOT NULL,
    `discountValue` INTEGER NOT NULL,
    `maximumDiscountPaise` INTEGER NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Promotion_enabled_startsAt_endsAt_idx`(`enabled`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionProduct` (
    `promotionId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    INDEX `PromotionProduct_productId_idx`(`productId`),
    PRIMARY KEY (`promotionId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionCategory` (
    `promotionId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,

    INDEX `PromotionCategory_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`promotionId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponCustomer` ADD CONSTRAINT `CouponCustomer_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponCustomer` ADD CONSTRAINT `CouponCustomer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionProduct` ADD CONSTRAINT `PromotionProduct_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionProduct` ADD CONSTRAINT `PromotionProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionCategory` ADD CONSTRAINT `PromotionCategory_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionCategory` ADD CONSTRAINT `PromotionCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
