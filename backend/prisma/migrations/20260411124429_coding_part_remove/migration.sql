/*
  Warnings:

  - You are about to drop the column `language` on the `SessionQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `starterCode` on the `SessionQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `testCases` on the `SessionQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SessionQuestion" DROP COLUMN "language",
DROP COLUMN "starterCode",
DROP COLUMN "testCases";
