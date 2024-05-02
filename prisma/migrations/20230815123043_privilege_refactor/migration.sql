/*
  Warnings:

  - You are about to drop the column `nameFr` on the `Privilege` table. All the data in the column will be lost.
  - Rename column 'nameEn' to 'name' on the table `Privilege`.
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
