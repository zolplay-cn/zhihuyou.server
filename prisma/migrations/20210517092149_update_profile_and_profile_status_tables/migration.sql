-- AlterTable
ALTER TABLE `Profile` MODIFY `bio` VARCHAR(191),
    MODIFY `city` VARCHAR(191);

-- AlterTable
ALTER TABLE `ProfileStatus` MODIFY `content` VARCHAR(255),
    MODIFY `emoji` VARCHAR(191),
    MODIFY `clearInterval` INTEGER DEFAULT 1;
