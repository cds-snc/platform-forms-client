-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "publishDesc" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "publishFormType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "publishReason" TEXT NOT NULL DEFAULT '';
