-- CreateTable
CREATE TABLE "TemplateUser" (
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "TemplateUser_pkey" PRIMARY KEY ("templateId","userId")
);

-- AddForeignKey
ALTER TABLE "TemplateUser" ADD CONSTRAINT "TemplateUser_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateUser" ADD CONSTRAINT "TemplateUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate existing data
INSERT INTO "TemplateUser" ("templateId", "userId", "role")
SELECT "_TemplateToUser"."A" as "templateId", "_TemplateToUser"."B" as "userId", 'owner' as "role"
FROM "_TemplateToUser";