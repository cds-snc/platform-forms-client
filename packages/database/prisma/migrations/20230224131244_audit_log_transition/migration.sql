/*
  Warnings:

  - You are about to drop the `AdminLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApiAccessLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminLog" DROP CONSTRAINT "AdminLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "ApiAccessLog" DROP CONSTRAINT "ApiAccessLog_userId_fkey";

-- AlterTable
ALTER TABLE "ApiUser" ADD COLUMN     "lastLogin" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLogin" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "AdminLog";

-- DropTable
DROP TABLE "ApiAccessLog";
