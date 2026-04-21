/*
  Warnings:

  - Added the required column `extractedText` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "extractedText" TEXT NOT NULL;
