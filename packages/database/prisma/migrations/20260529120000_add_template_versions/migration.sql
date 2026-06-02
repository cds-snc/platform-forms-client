-- CreateEnum
CREATE TYPE "TemplateVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUPERSEDED');

-- AlterTable
ALTER TABLE "Template" ADD COLUMN "currentPublishedVersionId" TEXT;
ALTER TABLE "Template" ADD COLUMN "currentDraftVersionId" TEXT;
ALTER TABLE "Template" ADD COLUMN "lastEditedByUserId" TEXT;

-- CreateTable
CREATE TABLE "TemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "TemplateVersionStatus" NOT NULL,
    "jsonConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "publishedAt" TIMESTAMPTZ(6),
    "supersededAt" TIMESTAMPTZ(6),
    "createdByUserId" TEXT,
    "publishedByUserId" TEXT,
    "publishReason" TEXT NOT NULL DEFAULT '',
    "publishFormType" TEXT NOT NULL DEFAULT '',
    "publishDesc" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_currentPublishedVersionId_key" ON "Template"("currentPublishedVersionId");
CREATE UNIQUE INDEX "Template_currentDraftVersionId_key" ON "Template"("currentDraftVersionId");
CREATE INDEX "Template_lastEditedByUserId_idx" ON "Template"("lastEditedByUserId");
CREATE INDEX "TemplateVersion_templateId_status_idx" ON "TemplateVersion"("templateId", "status");
CREATE UNIQUE INDEX "TemplateVersion_templateId_versionNumber_key" ON "TemplateVersion"("templateId", "versionNumber");

-- Partial unique indexes to ensure only one DRAFT and one PUBLISHED per templateId
CREATE UNIQUE INDEX "TemplateVersion_templateId_draft_unique" ON "TemplateVersion"("templateId") WHERE "status" = 'DRAFT';
CREATE UNIQUE INDEX "TemplateVersion_templateId_published_unique" ON "TemplateVersion"("templateId") WHERE "status" = 'PUBLISHED';

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "Template" ADD CONSTRAINT "Template_currentPublishedVersionId_fkey" FOREIGN KEY ("currentPublishedVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Template" ADD CONSTRAINT "Template_currentDraftVersionId_fkey" FOREIGN KEY ("currentDraftVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Template" ADD CONSTRAINT "Template_lastEditedByUserId_fkey" FOREIGN KEY ("lastEditedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;