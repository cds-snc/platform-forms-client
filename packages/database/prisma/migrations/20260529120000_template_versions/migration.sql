-- CreateEnum
CREATE TYPE "TemplateVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUPERSEDED');

-- AlterTable
ALTER TABLE "Template"
ADD COLUMN "currentPublishedVersionId" TEXT,
ADD COLUMN "currentDraftVersionId" TEXT;

-- CreateTable
CREATE TABLE "TemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "TemplateVersionStatus" NOT NULL,
    "jsonConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMPTZ(6),
    "supersededAt" TIMESTAMPTZ(6),
    "createdByUserId" TEXT,
    "publishedByUserId" TEXT,
    "publishReason" TEXT NOT NULL DEFAULT '',
    "publishFormType" TEXT NOT NULL DEFAULT '',
    "publishDesc" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TemplateVersion_pkey" PRIMARY KEY ("id")
);

-- Backfill existing template configuration into version 1 before removing Template.jsonConfig.
WITH version_rows AS (
    SELECT
        CONCAT('tv_', "id") AS "id",
        "id" AS "templateId",
        1 AS "versionNumber",
        CASE
            WHEN "isPublished" THEN 'PUBLISHED'::"TemplateVersionStatus"
            ELSE 'DRAFT'::"TemplateVersionStatus"
        END AS "status",
        "jsonConfig",
        "created_at" AS "createdAt",
        "updated_at" AS "updatedAt",
        CASE WHEN "isPublished" THEN "updated_at" ELSE NULL END AS "publishedAt",
        NULL::TIMESTAMPTZ(6) AS "supersededAt",
        NULL::TEXT AS "createdByUserId",
        NULL::TEXT AS "publishedByUserId",
        "publishReason",
        "publishFormType",
        "publishDesc"
    FROM "Template"
), inserted_versions AS (
    INSERT INTO "TemplateVersion" (
        "id",
        "templateId",
        "versionNumber",
        "status",
        "jsonConfig",
        "createdAt",
        "updatedAt",
        "publishedAt",
        "supersededAt",
        "createdByUserId",
        "publishedByUserId",
        "publishReason",
        "publishFormType",
        "publishDesc"
    )
    SELECT
        "id",
        "templateId",
        "versionNumber",
        "status",
        "jsonConfig",
        "createdAt",
        "updatedAt",
        "publishedAt",
        "supersededAt",
        "createdByUserId",
        "publishedByUserId",
        "publishReason",
        "publishFormType",
        "publishDesc"
    FROM version_rows
    RETURNING "id", "templateId", "status"
)
UPDATE "Template"
SET
    "currentPublishedVersionId" = CASE
        WHEN inserted_versions."status" = 'PUBLISHED'::"TemplateVersionStatus" THEN inserted_versions."id"
        ELSE NULL
    END,
    "currentDraftVersionId" = CASE
        WHEN inserted_versions."status" = 'DRAFT'::"TemplateVersionStatus" THEN inserted_versions."id"
        ELSE NULL
    END
FROM inserted_versions
WHERE "Template"."id" = inserted_versions."templateId";

-- CreateIndex
CREATE UNIQUE INDEX "Template_currentPublishedVersionId_key" ON "Template"("currentPublishedVersionId");
CREATE UNIQUE INDEX "Template_currentDraftVersionId_key" ON "Template"("currentDraftVersionId");
CREATE INDEX "TemplateVersion_templateId_status_idx" ON "TemplateVersion"("templateId", "status");
CREATE UNIQUE INDEX "TemplateVersion_templateId_versionNumber_key" ON "TemplateVersion"("templateId", "versionNumber");

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "Template" ADD CONSTRAINT "Template_currentPublishedVersionId_fkey" FOREIGN KEY ("currentPublishedVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Template" ADD CONSTRAINT "Template_currentDraftVersionId_fkey" FOREIGN KEY ("currentDraftVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- DropColumn
ALTER TABLE "Template" DROP COLUMN "jsonConfig";