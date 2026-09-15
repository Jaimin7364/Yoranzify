ALTER TABLE `Order` ADD COLUMN `courierName` VARCHAR(100) NULL, ADD COLUMN `deliveredAt` DATETIME(3) NULL,
  ADD COLUMN `internalNotes` TEXT NULL, ADD COLUMN `shippedAt` DATETIME(3) NULL,
  ADD COLUMN `trackingNumber` VARCHAR(120) NULL, ADD COLUMN `trackingUrl` VARCHAR(500) NULL;
CREATE TABLE `AdminAudit` (
  `id` INTEGER NOT NULL AUTO_INCREMENT, `actorId` INTEGER NOT NULL, `action` VARCHAR(100) NOT NULL,
  `entityType` VARCHAR(60) NOT NULL, `entityId` VARCHAR(100) NOT NULL, `summary` VARCHAR(500) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `AdminAudit_entityType_entityId_createdAt_idx`(`entityType`,`entityId`,`createdAt`),
  INDEX `AdminAudit_actorId_createdAt_idx`(`actorId`,`createdAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `AdminAudit` ADD CONSTRAINT `AdminAudit_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
