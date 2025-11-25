-- DropForeignKey
ALTER TABLE `UploadLink` DROP FOREIGN KEY `uploadLink_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `UploadLink` DROP FOREIGN KEY `uploadLink_visitId_fkey`;

-- AlterTable
ALTER TABLE `UploadLink` ADD COLUMN `beginTime` DATETIME(3) NULL,
    ADD COLUMN `employeeNo` VARCHAR(191) NULL,
    ADD COLUMN `endTime` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `UploadLink` ADD CONSTRAINT `UploadLink_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadLink` ADD CONSTRAINT `UploadLink_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
