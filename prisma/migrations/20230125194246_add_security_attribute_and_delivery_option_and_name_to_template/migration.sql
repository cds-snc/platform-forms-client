-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "securityAttribute" TEXT NOT NULL DEFAULT 'Unclassified',
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "DeliveryOption" (
    "id" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "emailSubjectEn" TEXT,
    "emailSubjectFr" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "DeliveryOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOption_templateId_key" ON "DeliveryOption"("templateId");

-- AddForeignKey
ALTER TABLE "DeliveryOption" ADD CONSTRAINT "DeliveryOption_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
