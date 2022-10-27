/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

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

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Privilege" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "permissions" JSONB NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "Privilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PrivilegeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TemplateToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Privilege_nameEn_key" ON "Privilege"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "Privilege_nameFr_key" ON "Privilege"("nameFr");

-- CreateIndex
CREATE UNIQUE INDEX "_PrivilegeToUser_AB_unique" ON "_PrivilegeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PrivilegeToUser_B_index" ON "_PrivilegeToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TemplateToUser_AB_unique" ON "_TemplateToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TemplateToUser_B_index" ON "_TemplateToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ApiUser_templateId_email_key" ON "ApiUser"("templateId", "email");

-- AddForeignKey
ALTER TABLE "_PrivilegeToUser" ADD CONSTRAINT "_PrivilegeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Privilege"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivilegeToUser" ADD CONSTRAINT "_PrivilegeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateToUser" ADD CONSTRAINT "_TemplateToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateToUser" ADD CONSTRAINT "_TemplateToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiAccessLog" ADD CONSTRAINT "ApiAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ApiUser"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ApiUser" ADD CONSTRAINT "ApiUser_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

    