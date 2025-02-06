/*
  Warnings:

  - You are about to alter the column `brand` on the `vehicle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `vehicle` MODIFY `brand` INTEGER NOT NULL;
