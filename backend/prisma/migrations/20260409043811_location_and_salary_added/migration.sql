/*
  Warnings:

  - Added the required column `location` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_applicationId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "salary" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
