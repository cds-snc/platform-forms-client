-- AlterTable
ALTER TABLE "_PrivilegeToUser" ADD CONSTRAINT "_PrivilegeToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PrivilegeToUser_AB_unique";

-- AlterTable
ALTER TABLE "_TemplateToUser" ADD CONSTRAINT "_TemplateToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TemplateToUser_AB_unique";
