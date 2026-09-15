ALTER TABLE `CouponUsage` ADD COLUMN `orderId` INTEGER NULL;

CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT, `orderNumber` VARCHAR(32) NOT NULL, `idempotencyKey` VARCHAR(64) NOT NULL, `userId` INTEGER NOT NULL,
    `status` ENUM('PLACED','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PLACED',
    `paymentMethod` ENUM('COD','RAZORPAY') NOT NULL, `paymentStatus` ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    `addressFullName` VARCHAR(100) NOT NULL, `addressMobile` VARCHAR(20) NOT NULL, `addressLine1` VARCHAR(180) NOT NULL, `addressLine2` VARCHAR(180) NULL,
    `addressLandmark` VARCHAR(120) NULL, `addressCity` VARCHAR(100) NOT NULL, `addressState` VARCHAR(100) NOT NULL, `addressPostalCode` VARCHAR(12) NOT NULL, `addressCountry` VARCHAR(80) NOT NULL,
    `merchandiseSubtotalPaise` INTEGER NOT NULL, `automaticDiscountPaise` INTEGER NOT NULL DEFAULT 0, `couponCode` VARCHAR(40) NULL,
    `couponDiscountPaise` INTEGER NOT NULL DEFAULT 0, `shippingPaise` INTEGER NOT NULL DEFAULT 0, `taxPaise` INTEGER NOT NULL DEFAULT 0, `totalPaise` INTEGER NOT NULL,
    `cancelledAt` DATETIME(3) NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`), UNIQUE INDEX `Order_idempotencyKey_key`(`idempotencyKey`),
    INDEX `Order_userId_createdAt_idx`(`userId`,`createdAt`), INDEX `Order_status_createdAt_idx`(`status`,`createdAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT, `orderId` INTEGER NOT NULL, `productId` INTEGER NOT NULL, `variantId` INTEGER NOT NULL,
    `productName` VARCHAR(180) NOT NULL, `productSlug` VARCHAR(200) NOT NULL, `sku` VARCHAR(100) NOT NULL, `colorName` VARCHAR(60) NOT NULL, `sizeName` VARCHAR(30) NOT NULL,
    `quantity` INTEGER NOT NULL, `unitPricePaise` INTEGER NOT NULL, `automaticDiscountPaise` INTEGER NOT NULL DEFAULT 0, `couponDiscountPaise` INTEGER NOT NULL DEFAULT 0,
    `taxPaise` INTEGER NOT NULL DEFAULT 0, `lineTotalPaise` INTEGER NOT NULL, INDEX `OrderItem_orderId_idx`(`orderId`), INDEX `OrderItem_variantId_idx`(`variantId`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `OrderStatusHistory` (`id` INTEGER NOT NULL AUTO_INCREMENT, `orderId` INTEGER NOT NULL,
    `status` ENUM('PLACED','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED') NOT NULL,
    `note` VARCHAR(255) NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX `OrderStatusHistory_orderId_createdAt_idx`(`orderId`,`createdAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `InventoryReservation` (`id` INTEGER NOT NULL AUTO_INCREMENT, `orderId` INTEGER NOT NULL, `variantId` INTEGER NOT NULL, `quantity` INTEGER NOT NULL,
    `status` ENUM('CONSUMED','RELEASED') NOT NULL DEFAULT 'CONSUMED', `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `releasedAt` DATETIME(3) NULL,
    INDEX `InventoryReservation_variantId_status_idx`(`variantId`,`status`), UNIQUE INDEX `InventoryReservation_orderId_variantId_key`(`orderId`,`variantId`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `CouponUsage_orderId_key` ON `CouponUsage`(`orderId`);
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `InventoryReservation` ADD CONSTRAINT `InventoryReservation_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `InventoryReservation` ADD CONSTRAINT `InventoryReservation_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
