/*
  Warnings:

  - You are about to drop the column `companyName` on the `Application` table. All the data in the column will be lost.
  - Added the required column `company` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "companyName",
ADD COLUMN     "company" TEXT NOT NULL;
