/*
  Warnings:

  - The values [CANCELLED] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `actualEnd` on the `Change` table. All the data in the column will be lost.
  - You are about to drop the column `actualStart` on the `Change` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');
ALTER TABLE "Change" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Change" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "Change" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_changeId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_changeId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- AlterTable
ALTER TABLE "Change" DROP COLUMN "actualEnd",
DROP COLUMN "actualStart",
ALTER COLUMN "impact" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "department",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "Comment";
