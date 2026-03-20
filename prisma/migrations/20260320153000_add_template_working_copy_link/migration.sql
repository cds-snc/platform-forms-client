ALTER TABLE "Template"
ADD COLUMN "sourceTemplateId" TEXT;

CREATE UNIQUE INDEX "Template_sourceTemplateId_key" ON "Template"("sourceTemplateId");

ALTER TABLE "Template"
ADD CONSTRAINT "Template_sourceTemplateId_fkey"
FOREIGN KEY ("sourceTemplateId") REFERENCES "Template"("id")
ON DELETE SET NULL
ON UPDATE NO ACTION;
