/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Privelege" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "permissions" JSONB NOT NULL,

    CONSTRAINT "Privelege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PrivelegeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Privelege_nameEn_key" ON "Privelege"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "Privelege_nameFr_key" ON "Privelege"("nameFr");

-- CreateIndex
CREATE UNIQUE INDEX "_PrivelegeToUser_AB_unique" ON "_PrivelegeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PrivelegeToUser_B_index" ON "_PrivelegeToUser"("B");

-- AddForeignKey
ALTER TABLE "_PrivelegeToUser" ADD CONSTRAINT "_PrivelegeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Privelege"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivelegeToUser" ADD CONSTRAINT "_PrivelegeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
