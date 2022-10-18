/*
  Warnings:

  - You are about to drop the `AccessLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "FormUser" DROP CONSTRAINT "FormUser_templateId_fkey";

-- RenameTable
ALTER TABLE "AccessLog" RENAME TO "ApiAccessLog";

-- RenameTable
ALTER TABLE "FormUser" RENAME TO "ApiUser";

-- AlterTable
ALTER TABLE "ApiAccessLog" RENAME CONSTRAINT "AccessLog_pkey" TO "ApiAccessLog_pkey";

-- AlterTable
ALTER TABLE "ApiUser" RENAME CONSTRAINT "FormUser_pkey" TO "ApiUser_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "ApiUser_templateId_email_key" ON "ApiUser"("templateId", "email");

-- AddForeignKey
ALTER TABLE "ApiAccessLog" ADD CONSTRAINT "ApiAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ApiUser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ApiUser" ADD CONSTRAINT "ApiUser_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
