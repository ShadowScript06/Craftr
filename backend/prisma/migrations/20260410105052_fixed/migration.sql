/*
  Warnings:

  - Changed the type of `domain` on the `Interview` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `InterviewSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `SessionQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `difficulty` to the `SessionQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "domain",
ADD COLUMN     "domain" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SessionQuestion" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Domain";

-- DropEnum
DROP TYPE "QuestionDifficulty";

-- DropEnum
DROP TYPE "QuestionType";

-- DropEnum
DROP TYPE "SessionStatus";
