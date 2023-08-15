/*
  Warnings:

  - You are about to drop the column `nameEn` on the `Privilege` table. All the data in the column will be lost.
  - You are about to drop the column `nameFr` on the `Privilege` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Privilege` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Privilege` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Privilege_nameEn_key";

-- DropIndex
DROP INDEX "Privilege_nameFr_key";

-- AlterTable
ALTER TABLE "Privilege" DROP COLUMN "nameFr";
ALTER TABLE "Privilege" RENAME COLUMN "nameEn" TO "name";

-- CreateIndex
CREATE UNIQUE INDEX "Privilege_name_key" ON "Privilege"("name");
