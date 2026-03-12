-- CreateTable
CREATE TABLE "TemplateEditLock" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "lockedByUserId" TEXT NOT NULL,
    "lockedByName" TEXT,
    "lockedByEmail" TEXT,
    "lockedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heartbeatAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "sessionId" TEXT,

    CONSTRAINT "TemplateEditLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateEditLock_templateId_key" ON "TemplateEditLock"("templateId");

-- CreateIndex
CREATE INDEX "TemplateEditLock_expiresAt_idx" ON "TemplateEditLock"("expiresAt");

-- AddForeignKey
ALTER TABLE "TemplateEditLock" ADD CONSTRAINT "TemplateEditLock_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
