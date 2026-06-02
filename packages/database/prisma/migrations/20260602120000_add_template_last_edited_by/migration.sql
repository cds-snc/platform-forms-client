-- AlterTable
ALTER TABLE "Template" ADD COLUMN "lastEditedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Template_lastEditedByUserId_idx" ON "Template"("lastEditedByUserId");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_lastEditedByUserId_fkey" FOREIGN KEY ("lastEditedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;