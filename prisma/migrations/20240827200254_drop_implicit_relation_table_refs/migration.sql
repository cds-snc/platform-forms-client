/*
  Warnings:

  - You are about to drop the `_TemplateToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TemplateToUser" DROP CONSTRAINT "_TemplateToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TemplateToUser" DROP CONSTRAINT "_TemplateToUser_B_fkey";

-- DropTable
DROP TABLE "_TemplateToUser";
