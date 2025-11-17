/*
  Warnings:

  - You are about to drop the column `originalName` on the `uploadlink` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `uploadLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UploadLink` DROP COLUMN `originalName`,
    ADD COLUMN `expiresAt` DATETIME(3) NOT NULL,
    ADD COLUMN `validated` BOOLEAN NOT NULL DEFAULT false;
