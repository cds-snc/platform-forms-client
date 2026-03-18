-- CreateTable
CREATE TABLE "TemplateArchive" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT NOT NULL,
    "jsonConfig" JSONB NOT NULL,

    CONSTRAINT "TemplateArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemplateArchive_templateId_created_at_idx" ON "TemplateArchive"("templateId", "created_at");

-- AddForeignKey
ALTER TABLE "TemplateArchive"
ADD CONSTRAINT "TemplateArchive_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "Template"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;
