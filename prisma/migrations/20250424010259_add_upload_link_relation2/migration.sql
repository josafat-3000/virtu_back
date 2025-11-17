/*
  Warnings:

  - You are about to drop the column `createdBy` on the `uploadlink` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `uploadLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UploadLink` DROP COLUMN `createdBy`,
    ADD COLUMN `createdById` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `UploadLink` ADD CONSTRAINT `uploadLink_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;