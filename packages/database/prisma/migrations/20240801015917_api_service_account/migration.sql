/*
  Warnings:

  - You are about to drop the `ApiUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiUser" DROP CONSTRAINT "ApiUser_templateId_fkey";

-- DropTable
DROP TABLE "ApiUser";

-- CreateTable
CREATE TABLE "ApiServiceAccount" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "templateId" TEXT NOT NULL,
    "publicKeyId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,

    CONSTRAINT "ApiServiceAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiServiceAccount_templateId_key" ON "ApiServiceAccount"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiServiceAccount_publicKeyId_key" ON "ApiServiceAccount"("publicKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiServiceAccount_publicKey_key" ON "ApiServiceAccount"("publicKey");

-- AddForeignKey
ALTER TABLE "ApiServiceAccount" ADD CONSTRAINT "ApiServiceAccount_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
