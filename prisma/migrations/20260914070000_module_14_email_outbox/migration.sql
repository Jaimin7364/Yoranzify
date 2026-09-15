CREATE TABLE `EmailOutbox` (
  `id` INTEGER NOT NULL AUTO_INCREMENT, `dedupeKey` VARCHAR(191) NOT NULL, `recipient` VARCHAR(191) NOT NULL,
  `template` VARCHAR(60) NOT NULL, `subject` VARCHAR(180) NOT NULL, `html` LONGTEXT NOT NULL, `text` TEXT NOT NULL,
  `status` ENUM('PENDING','SENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING', `attempts` INTEGER NOT NULL DEFAULT 0,
  `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `lastError` VARCHAR(500) NULL, `sentAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `EmailOutbox_dedupeKey_key`(`dedupeKey`), INDEX `EmailOutbox_status_nextAttemptAt_idx`(`status`, `nextAttemptAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
