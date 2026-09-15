-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `line1` VARCHAR(180) NOT NULL,
    `line2` VARCHAR(180) NULL,
    `landmark` VARCHAR(120) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `postalCode` VARCHAR(12) NOT NULL,
    `country` VARCHAR(80) NOT NULL DEFAULT 'India',
    `type` ENUM('HOME', 'WORK', 'OTHER') NOT NULL DEFAULT 'HOME',
    `isDefaultShipping` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Address_userId_isDefaultShipping_idx`(`userId`, `isDefaultShipping`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
