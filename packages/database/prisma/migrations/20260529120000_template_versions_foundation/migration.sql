-- CreateEnum
CREATE TYPE "TemplateVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUPERSEDED');

-- AlterTable
ALTER TABLE "Template" ADD COLUMN "currentPublishedVersionId" TEXT;
ALTER TABLE "Template" ADD COLUMN "currentDraftVersionId" TEXT;

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

UPDATE "Template"
SET "currentPublishedVersionId" = 'tv_' || "id"
WHERE "isPublished" = true;

UPDATE "Template"
SET "currentDraftVersionId" = 'tv_' || "id"
WHERE "isPublished" = false;

-- CreateIndex
CREATE UNIQUE INDEX "Template_currentPublishedVersionId_key" ON "Template"("currentPublishedVersionId");
CREATE UNIQUE INDEX "Template_currentDraftVersionId_key" ON "Template"("currentDraftVersionId");
CREATE INDEX "TemplateVersion_templateId_status_idx" ON "TemplateVersion"("templateId", "status");
CREATE UNIQUE INDEX "TemplateVersion_templateId_versionNumber_key" ON "TemplateVersion"("templateId", "versionNumber");

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "Template" ADD CONSTRAINT "Template_currentPublishedVersionId_fkey" FOREIGN KEY ("currentPublishedVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Template" ADD CONSTRAINT "Template_currentDraftVersionId_fkey" FOREIGN KEY ("currentDraftVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;