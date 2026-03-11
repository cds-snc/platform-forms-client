/*
  Warnings:

  - You are about to drop the column `admin` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRATOR', 'PROGRAM_ADMINISTRATOR');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "admin",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT E'PROGRAM_ADMINISTRATOR';
