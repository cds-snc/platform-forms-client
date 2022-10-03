/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Privelage" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "permissions" JSONB NOT NULL,

    CONSTRAINT "Privelage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PrivelageToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Privelage_nameEn_key" ON "Privelage"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "Privelage_nameFr_key" ON "Privelage"("nameFr");

-- CreateIndex
CREATE UNIQUE INDEX "_PrivelageToUser_AB_unique" ON "_PrivelageToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PrivelageToUser_B_index" ON "_PrivelageToUser"("B");

-- AddForeignKey
ALTER TABLE "_PrivelageToUser" ADD CONSTRAINT "_PrivelageToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Privelage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivelageToUser" ADD CONSTRAINT "_PrivelageToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
