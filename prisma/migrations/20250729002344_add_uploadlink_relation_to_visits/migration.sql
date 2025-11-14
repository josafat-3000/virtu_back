/*
  Warnings:

  - You are about to drop the column `name` on the `uploadlink` table. All the data in the column will be lost.

*/
-- AlterTable
-- ALTER TABLE `uploadlink` DROP COLUMN `name`,
--     ADD COLUMN `visitId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `uploadLink` ADD CONSTRAINT `uploadLink_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
