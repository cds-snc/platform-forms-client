/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
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

    CONSTRAINT "Privilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PrivilegeToUser" (
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

-- AddForeignKey
ALTER TABLE "_PrivilegeToUser" ADD CONSTRAINT "_PrivilegeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Privilege"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivilegeToUser" ADD CONSTRAINT "_PrivilegeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
