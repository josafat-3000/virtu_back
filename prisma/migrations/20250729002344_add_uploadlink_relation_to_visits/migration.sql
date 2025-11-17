/*
  Warnings:

  - You are about to drop the column `name` on the `uploadlink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UploadLink` ADD COLUMN `visitId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `UploadLink` ADD CONSTRAINT `uploadLink_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
