/*
  Warnings:

  - Added the required column `explaination` to the `PreparationQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PreparationQuestion" ADD COLUMN     "explaination" TEXT NOT NULL;
