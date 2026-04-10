/*
  Warnings:

  - You are about to drop the column `difficulty` on the `SessionQuestion` table. All the data in the column will be lost.
  - Added the required column `difficulty` to the `InterviewSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SessionQuestion" DROP COLUMN "difficulty";
