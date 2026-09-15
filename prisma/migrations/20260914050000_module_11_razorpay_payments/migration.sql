ALTER TABLE `Order` MODIFY `status` ENUM('PENDING_PAYMENT','PLACED','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PLACED';
ALTER TABLE `OrderStatusHistory` MODIFY `status` ENUM('PENDING_PAYMENT','PLACED','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED') NOT NULL;
CREATE TABLE `Payment` (
  `id` INTEGER NOT NULL AUTO_INCREMENT, `orderId` INTEGER NOT NULL, `gatewayOrderId` VARCHAR(80) NOT NULL, `gatewayPaymentId` VARCHAR(80) NULL,
  `status` ENUM('INITIATED','AUTHORIZED','CAPTURED','FAILED','EXPIRED','REFUNDED') NOT NULL DEFAULT 'INITIATED', `amountPaise` INTEGER NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'INR', `failureCode` VARCHAR(100) NULL, `failureDescription` VARCHAR(500) NULL, `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Payment_gatewayOrderId_key`(`gatewayOrderId`), UNIQUE INDEX `Payment_gatewayPaymentId_key`(`gatewayPaymentId`),
  INDEX `Payment_orderId_createdAt_idx`(`orderId`,`createdAt`), INDEX `Payment_status_expiresAt_idx`(`status`,`expiresAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `WebhookEvent` (
  `id` INTEGER NOT NULL AUTO_INCREMENT, `gatewayEventId` VARCHAR(100) NOT NULL, `eventType` VARCHAR(100) NOT NULL, `payloadHash` CHAR(64) NOT NULL,
  `processedAt` DATETIME(3) NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `WebhookEvent_gatewayEventId_key`(`gatewayEventId`), INDEX `WebhookEvent_eventType_createdAt_idx`(`eventType`,`createdAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
