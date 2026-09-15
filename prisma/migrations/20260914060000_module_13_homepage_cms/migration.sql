CREATE TABLE `Banner` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `desktopMediaId` INTEGER NOT NULL,
  `mobileMediaId` INTEGER NULL,
  `altText` VARCHAR(180) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `subtitle` VARCHAR(300) NULL,
  `buttonText` VARCHAR(60) NULL,
  `buttonUrl` VARCHAR(500) NULL,
  `position` INTEGER NOT NULL DEFAULT 0,
  `startsAt` DATETIME(3) NULL,
  `endsAt` DATETIME(3) NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Banner_enabled_startsAt_endsAt_position_idx`(`enabled`, `startsAt`, `endsAt`, `position`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Banner_desktopMediaId_fkey` FOREIGN KEY (`desktopMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Banner_mobileMediaId_fkey` FOREIGN KEY (`mobileMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `HomepageSection` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `type` ENUM('HERO','CATEGORIES','NEW_ARRIVALS','TRENDING','BEST_SELLERS','OFFERS','FEATURED_COLLECTION','GALLERY','TESTIMONIALS') NOT NULL,
  `title` VARCHAR(160) NULL,
  `subtitle` VARCHAR(300) NULL,
  `linkUrl` VARCHAR(500) NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `position` INTEGER NOT NULL DEFAULT 0,
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `HomepageSection_type_key`(`type`),
  INDEX `HomepageSection_enabled_position_idx`(`enabled`, `position`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `HomepageSection` (`type`, `title`, `enabled`, `position`, `updatedAt`) VALUES
('HERO', 'Campaign stories', true, 0, CURRENT_TIMESTAMP(3)),
('CATEGORIES', 'Shop by world', true, 1, CURRENT_TIMESTAMP(3)),
('NEW_ARRIVALS', 'The new edit', true, 2, CURRENT_TIMESTAMP(3)),
('FEATURED_COLLECTION', 'Featured pieces', true, 3, CURRENT_TIMESTAMP(3)),
('BEST_SELLERS', 'Best sellers', true, 4, CURRENT_TIMESTAMP(3)),
('OFFERS', 'The sale edit', true, 5, CURRENT_TIMESTAMP(3)),
('TRENDING', 'Trending now', false, 6, CURRENT_TIMESTAMP(3)),
('GALLERY', 'The journal', false, 7, CURRENT_TIMESTAMP(3)),
('TESTIMONIALS', 'Worn and loved', false, 8, CURRENT_TIMESTAMP(3));
