/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `expires_at` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `user_id` on the `admin_logs` table. All the data in the column will be lost.
  - The primary key for the `form_users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `template_id` on the `form_users` table. All the data in the column will be lost.
  - You are about to drop the column `temporary_token` on the `form_users` table. All the data in the column will be lost.
  - The primary key for the `organizations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nameen` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `namefr` on the `organizations` table. All the data in the column will be lost.
  - The primary key for the `sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bearer_token` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `json_config` on the `templates` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `organization` on the `users` table. All the data in the column will be lost.
  - The `emailVerified` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `verification_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `verification_tokens` table. All the data in the column will be lost.
  - You are about to drop the `migrations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId,email]` on the table `form_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,token]` on the table `verification_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `admin_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `form_users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `expires` on the `sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expires` on the `verification_tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "fk_user_id";

-- DropForeignKey
ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "form_users" DROP CONSTRAINT "form_users_template_id_fkey";
ALTER TABLE "form_users" DROP CONSTRAINT "template_id_email_unique";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "fk_user_id";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organization_fkey";

-- DropIndex
DROP INDEX "provider_account_id";

-- DropIndex
DROP INDEX "provider_id";

-- DropIndex
DROP INDEX "user_id";

-- DropIndex
DROP INDEX "token";

-- DropIndex
DROP INDEX "email";

-- AlterTable
ALTER TABLE "accounts" RENAME TO "Account";
ALTER TABLE "Account" DROP CONSTRAINT "accounts_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE INTEGER USING ("expires_at"::INTEGER),
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "accounts_id_seq";

-- AlterTable
ALTER TABLE "admin_logs" RENAME TO "AdminLog";
ALTER TABLE "AdminLog" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "AdminLog" RENAME CONSTRAINT "admin_logs_pkey" TO "AdminLog_pkey";
ALTER TABLE "AdminLog"
ALTER COLUMN "userId" Set DATA TYPE TEXT,
ALTER COLUMN "action" SET DATA TYPE TEXT,
ALTER COLUMN "event" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "form_users" RENAME TO "FormUser";
ALTER TABLE "FormUser" DROP CONSTRAINT "form_users_pkey";
ALTER TABLE "FormUser" RENAME COLUMN "template_id" TO "templateId";
ALTER TABLE "FormUser" RENAME COLUMN "temporary_token" TO "temporaryToken";
ALTER TABLE "FormUser"
ALTER COLUMN "templateId" SET DATA TYPE TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "FormUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "form_users_id_seq";

-- AlterTable
ALTER TABLE "templates" RENAME TO "Template";
ALTER TABLE "Template" DROP CONSTRAINT "templates_pkey";
ALTER TABLE "Template" RENAME COLUMN "bearer_token" TO "bearerToken";
ALTER TABLE "Template" RENAME COLUMN "json_config" TO "jsonConfig";
ALTER TABLE "Template" DROP COLUMN "organization";
ALTER TABLE "Template"
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "jsonConfig" SET NOT NULL,
ADD CONSTRAINT "Template_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "templates_id_seq";

-- AlterTable
ALTER TABLE "users" RENAME TO "User";
ALTER TABLE "User" DROP CONSTRAINT "users_pkey";
ALTER TABLE "User" DROP COLUMN "organization";
ALTER TABLE "User"
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";


-- DropTable
DROP TABLE "migrations";

-- DropTable
DROP TABLE "verification_tokens";

-- DropTable
DROP TABLE "sessions";

-- DROP Table
DROP TABLE "organizations";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "FormUser_templateId_email_key" ON "FormUser"("templateId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormUser" ADD CONSTRAINT "FormUser_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;