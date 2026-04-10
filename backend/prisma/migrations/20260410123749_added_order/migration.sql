/*
  Warnings:

  - Added the required column `order` to the `SessionQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionQuestion" ADD COLUMN     "order" INTEGER NOT NULL;
